// I2Cのアドレス変更用モーダル

if (!window.aztool) aztool = {};

aztool.stpaddr = {};


// モーダルを閉じた後のコールバック
aztool.stpaddr.cb_func = null;

// 何用の設定か
aztool.stpaddr.type = "azxp";

// オプションおきの設定できるアドレス範囲
aztool.stpaddr.addr_range = {
    "azxp": {"min": 0x30, "max": 0x37}
}

// オプションの名前
aztool.stpaddr.type_name_list = {
    "azxp": "AZエキスパンダ"
};

// アドレスチェックしている現在のインデックス
aztool.stpaddr.search_index = 0;

// アドレス検索して存在したアドレスのリスト
aztool.stpaddr.search_list = [];

// アドレスチェック用の関数
aztool.stpaddr.check_func = function() {};

// ピン設定初期化
aztool.stpaddr.init = function() {
    // モーダル用HTML登録
    aztool.stpaddr.init_html();
    // モーダル登録
    aztool.stpaddr.mdl = $('[data-remodal-id=stpaddr_modal]').remodal();
    aztool.stpaddr.mdl.settings.closeOnOutsideClick = false;
    aztool.stpaddr.mdl.settings.hashTracking = false;

};

// モーダル用HTML登録
aztool.stpaddr.init_html = function() {
    let html = `
        <div id="stpaddr_modal_box" class="remodal azmodal" data-remodal-id="stpaddr_modal" 
                data-remodal-options="hashTracking: false, closeOnOutsideClick: false"
                style="max-width: 1200px;">
        </div>`;
    $("body").append(html);

};

// アドレス選択HTMLを書き込む
aztool.stpaddr.set_select_addr_html = function() {
    let tname = aztool.stpaddr.type_name_list[aztool.stpaddr.type];
    let html = `
    <font style="font-size: 24px;"><b>接続する` + tname + `のアドレスを選択する</b></font><br><br>
    <div style="height: 80px;"></div>
    <font style="font-size: 22px;">接続する` + tname + `：</font>　　<div id="change_addr_box" style="display: inline-block;">接続機器検索中</div>
    　　<a id="change_addr_select_btn" class="exec-button" onClick="javascript:aztool.stpaddr.eve_ok_click(1);">選択</a>
    <div style="height: 120px;"></div>
    <a id="pin_set_cancel" class="cancel-button" onClick="javascript:aztool.stpaddr.eve_ok_click(0);">キャンセル</a>
    <div style="height: 50px;"></div>
    `;
    $("#stpaddr_modal_box").html(html);
    $("#change_addr_select_btn").hide();
};

// 選択できるアドレスに接続されているアドレス一覧を入れる
// <select id="change_addr_select" style="font-size: 22px; width: 150px;"><option> 未選択 </option></select>
aztool.stpaddr.inner_select_addr_html = function(div_id, select_div_id, select_val) {
    let i, x, s;
    let html = "";
    html += "<select id='"+select_div_id+"' style='font-size: 22px; width: 150px;'>";
    html += "<option value='0'>　未選択　</option>";
    for (i in aztool.stpaddr.search_list) {
        x = aztool.stpaddr.search_list[i];
        s = (x == select_val)? " selected": "";
        html += "<option value='"+x+"'"+s+">　"+aztool.to_hex(x)+"　</option>";
    }
    html += "</select>";
    $("#"+div_id).html(html);
}


// AZエキスパンダ 指定したアドレスの機器が接続されているかチェック
aztool.stpaddr.check_addr_azxp = function(addr, cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.i2c_write(addr, [0x00], function(stat) { // PING
        if (stat == 0) {
            webhid.i2c_read(addr, 1, function(stat, res) {
                if (!res.length) {
                    cb_func(1); // 取得データ何もなしなら接続無し
                } else if (res[0] == addr) {
                    cb_func(0); // エコーが戻ってきてアドレスも一致していればOK
                } else {
                    cb_func(2); // 戻って来たけどアドレスエコーで無ければ接続無し判定
                }
            });
        } else {
            cb_func(-1); // コマンド送信失敗はエラー
        }
    });
};

// 接続されているアドレスを探す
aztool.stpaddr.search_addr = function(cb_func, init_flag) {
    // 初期化
    if (init_flag) {
        aztool.stpaddr.search_index = aztool.stpaddr.addr_range[aztool.stpaddr.type].min; // 検索範囲の最小値のアドレスを指定
        aztool.stpaddr.search_list = [];
    }
    // 検索用関数設定
    aztool.stpaddr.check_func = aztool.stpaddr.check_addr_azxp;
    // if (aztool.stpaddr.type == "nnn") aztool.stpaddr.check_func = aztool.stpaddr.check_addr_nnn;
    // 検索開始
    aztool.stpaddr.check_func(aztool.stpaddr.search_index, function(stat) {
        // 存在すれば存在リストに追加
        if (stat == 0) {
            aztool.stpaddr.search_list.push(aztool.stpaddr.search_index);
        }
        aztool.stpaddr.search_index++;
        if (aztool.stpaddr.search_index > aztool.stpaddr.addr_range[aztool.stpaddr.type].max) {
            // 検索範囲の最大までチェックしたら終了
            cb_func();
        } else {
            // まだ検索範囲内ならちょっと待って次のアドレスを調べる
            setTimeout(function() {
                aztool.stpaddr.search_addr(cb_func);
            }, 50);
        }
    });
};

// AZエキスパンダのアドレスを変更する
aztool.stpaddr.change_addr_azxp = function(old_addr, new_addr, cb_func) {
    if (!cb_func) cb_func = function() {};
    // まず今の設定を読み込み
    aztool.read_azxp_setting(old_addr, function(stat, res) {
        // 読み込み失敗したらエラーで返す
        if (stat != 0 || !res.length) {
            cb_func(1); // 読み込みで失敗
            return;
        }
        // 取得した設定のアドレスだけ新しいのに書換え
        res[0] = new_addr;
        // 設定を書込み
        aztool.write_azxp_setting(old_addr, res, function(stat) {
            if (stat != 0) {
                cb_func(2); // 書込みで失敗
                return;
            }
            // アドレスが変わるとAZエキスパンダが再起動するからちょっと待ってからコールバック実行
            setTimeout(function() {
                cb_func(0);
            }, 500);
        });
    });
};

// OK、キャンセルのクリックイベント(click_type = 0 キャンセル / 1 決定)
aztool.stpaddr.eve_ok_click = function(click_type) {
    let s = $("#change_addr_select").val();
    // キャンセルならそのまま閉じる
    if (click_type == 0 || s === undefined) {
        aztool.stpaddr.cb_func(click_type, {"addr": aztool.stpaddr.select_addr});
        aztool.stpaddr.mdl.close();
        return;
    }
    aztool.stpaddr.select_addr = parseInt(s);
    // コールバックを実行してモーダルを閉じる
    aztool.stpaddr.cb_func(click_type, {"addr": aztool.stpaddr.select_addr});
    aztool.stpaddr.mdl.close();
    return;
};

// IOエキスパンダ設定のモーダルを開く
// cb_func = OK後のコールバック
aztool.stpaddr.open_select_addr = function(select_addr, opt, cb_func) {
    // オプション受け取り
    aztool.stpaddr.option = opt;
    aztool.stpaddr.type = (opt.type)? opt.type: "azxp";
    // エキスパンダ設定受け取り
    aztool.stpaddr.select_addr = select_addr;
    // コールバック受け取り
    if (!cb_func) cb_func = function() {};
    aztool.stpaddr.cb_func = cb_func;
    // アドレス選択のモーダルにする
    aztool.stpaddr.set_select_addr_html();
    // モーダルを開く
    aztool.stpaddr.mdl.open();
    // 接続されているAZエキスパンダを探す
    aztool.stpaddr.search_addr(function() {
        $("#change_addr_select_btn").show();
        aztool.stpaddr.inner_select_addr_html("change_addr_box", "change_addr_select", aztool.stpaddr.select_addr);

    }, true);
};
