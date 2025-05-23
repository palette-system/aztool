// キーマップ設定


if (!window.aztool) aztool = {};

// 今選択中のレイヤー番号
aztool.setmap_select_layer = "";

// 設定操作中フラグ
aztool.setmap_stat = 0; // 0=何もしてない / 1=一括設定中 / 2=1キー設定中 / 3=レイヤー設定 / 4=アクチュエーションポイント設定

// 表示キーの文字language 0=日本語 / 1=英語
aztool.setmap_language = 0;

// キーマップ設定画面表示
aztool.view_setmap = function() {
    let h = "";
    if (aztool.is_vertical()) {
        // スマホなどの縦長の場合
        h += `
        <div class='menu_bbutton' onClick='javascript:aztool.setmap_all_set(0);'>一括設定</div>
        <div class='menu_bbutton' onClick='javascript:aztool.setmap_layer_set();'>レイヤー設定</div>
        <div class='menu_bbutton' onClick='javascript:aztool.setmap_layer_copy();'>コピーレイヤーを作成</div>
        <div id='menu_actuation_btn' class='menu_bbutton' style='display: none;' onClick='javascript:aztool.actuation_setting();'>アクチュエーション</div>
        <div class='menu_bbutton' onClick='javascript:aztool.view_setmap_end();'>戻る</div>
        <br>
        <div id='save_btn_box'></div>
        <br><br>

        <div id='key_layout_box' style='width: 100%; height: 900px;overflow: hidden; border: solid 1px black; text-align: left;'></div>
        <br><br>

        <div id='key_set_list' style='width: 100%; height: 700px;overflow-x: hidden; overflow-y: scroll; background-color: #e8e8f8; text-align: left; display: none;'></div>
        <div id="setmap_info"></div>
        `;

    } else {
        // 横長の場合
        h += `
        <div  style="width: 1400px;">
        <table><tr><td class="leftmenu-box">
        <div class='menu_bbutton' onClick='javascript:aztool.setmap_all_set(0);'>一括設定</div>
        <div class='menu_bbutton' onClick='javascript:aztool.setmap_layer_set();'>レイヤー設定</div>
        <div class='menu_bbutton' onClick='javascript:aztool.setmap_layer_copy();'>コピーレイヤーを作成</div>
        <div id='menu_actuation_btn' class='menu_bbutton' style='display: none;' onClick='javascript:aztool.actuation_setting();'>アクチュエーション</div>
        <div class='menu_bbutton' onClick='javascript:aztool.view_setmap_end();'>戻る</div>
        <br>
        <div id='save_btn_box'></div>
        </td><td valign="top" style="padding: 20px;">
        <div id='key_layout_box' style='width: 1000px; height: 400px;overflow: hidden; border: solid 1px black; text-align: left;'></div>
        <div id='key_set_list' style='width: 1000px; height: 350px;overflow-x: hidden; overflow-y: scroll; background-color: #e8e8f8; text-align: left;'></div>
        <div id="setmap_info"></div>
        </td></tr></table>
        `;
    
    }
    $("#main_box").html(h);
    aztool.setmap_stat = 0;
    // 選択中のレイヤーをデフォルトにする
    aztool.setmap_select_layer = "layer_" + aztool.setting_json_data.default_layer;
    // キーのレイアウト表示
    aztool.view_key_layout();
    // ボタンに設定されている文字を表示
    aztool.setmap_key_string_update();
    // 設定用キーコードリスト表示
    aztool.key_set_list_init();
    // 対応キーボードだけアクチュエーション設定ボタンを表示
    if (aztool.is_actuation_kb()) {
        $("#menu_actuation_btn").show();
    }
};

// キーマップ設定終了
aztool.view_setmap_end = function() {
    aztool.setmap_stat = 0;
    aztool.view_top_menu();
};

// モーダル用HTML登録
aztool.setmap_init = function() {
    // モーダル用HTML登録
    var mw = "1200px", mh = "600px";
    // スマホの場合のモーダルのサイズ
    if (aztool.is_vertical()) {
        mw = "100%";
        mh = "80%";
    }
    let html = `
        <!-- レイヤー設定用モーダル -->
        <div class="remodal azmodal" data-remodal-id="setmap_layer_modal" 
                data-remodal-options="hashTracking: false, closeOnOutsideClick: false"
                style="max-width: ` + mw + `; width: ` + mw + `; min-height: ` + mh + `;">
            <table style="display: inline-block; margin: 50px 0;"><tr><td valign="top">
            <font style="font-size: 14px;">レイヤーリスト</font><br>
            <ul id="layer_list" class="layer_list_box"></ul>
            </td><td valign="bottom">
            <div class="list_side_btn" onClick="javascript: aztool.setmap_layer_add_btn_click();">＋追加</div><br>
            <div class="list_side_btn" onClick="javascript: aztool.setmap_layer_delete_btn_click();">－削除</div><br>
            </td><td valign="top" style="width: 500px;">
            <div id="layer_edit_form">
            <table style="font-size: 14px; height: 180px;">
            <tr><td>レイヤー番号</td><td><input id="layer_num_edit" type="text" class="layer_input_box" value="0"></td></tr>
            <tr><td>レイヤー名</td><td><input id="layer_name_edit" type="text" class="layer_input_box" value="レイヤー１"></td></tr>
            </table>
            <br><br>
            <div style="text-align: center;">
            <div id="layer_edit_form_info"></div>
            <a id="pin_set_ok" class="exec-button" onClick="javascript:aztool.setmap_layer_default_layer_set();" style="width: 240px;">デフォルトのレイヤーにする</a>　
            <a id="pin_set_ok" class="exec-button" onClick="javascript:aztool.setmap_layer_form_save();">反映</a>
            </div>
            </div>
            </td></tr></table>
            <div style="text-align: right; width: 1050px;margin: 0 0 20px 0;">
            <a id="pin_set_ok" class="exec-button" onClick="javascript:aztool.setmap_layer_edit_close(1);">決定</a>　
            <a id="pin_set_cancel" class="cancel-button" onClick="javascript:aztool.setmap_layer_edit_close(0);">キャンセル</a>
            </div>
        </div>`;
    $("body").append(html);
    // モーダル登録
    aztool.setmap_layer_mdl = $('[data-remodal-id=setmap_layer_modal]').remodal();
    aztool.setmap_layer_mdl.settings.closeOnOutsideClick = false;
    aztool.setmap_layer_mdl.settings.hashTracking = false;
    // リストの操作登録
    $('#layer_list').sortable({
        "distance": 5,
        "axis": "y",
        "opacity": 0.5,
        "update": function(event, ui) {
            // 並び順が変更された
            // 編集中データの並び替え
            let ll = $('#layer_list').sortable("toArray"); // リストの並び順取得
            let i, k, s, r = {};
            for (i in ll) {
                s = ll[i].split("_");
                k = s[1] + "_" + s[2];
                r[k] = aztool.setmap_layer_edit_data[k];
            }
            aztool.setmap_layer_edit_data = r;
        }
    });
};

// 設定用キーコードリスト表示
aztool.key_set_list_init = function() {
    let c, d, i, j, k, n, h = "";
    let code_list = [];
    // コードのリストを表示
    h += "<table style='padding: 10px;'>";
    for (i in aztool.key_category) {
        k = aztool.key_category[i];
        h += "<tr><td><b>"+k.category+"</b></td><td>";
        h += "<tr><td>";
        h += "<table>";
        for (j in k.list) {
            h += "<tr><td valign='top' align='right' style='padding: 15px 10px;white-space:nowrap;'>"+k.list[j].name+"</td><td style='padding: 10px 0;'>";
            for (n in k.list[j].list) {
                c = k.list[j].list[n];
                d = aztool.get_key_data(2, c);
                h += "<div id='ks_"+c+"' style='padding: 6px;margin: 4px; width: 30px; height: 30px;display: inline-block;border: solid 1px #b9b9b9; background-color: #fff;font-size: 12px;text-align: center;overflow: hidden;'>"+d.str+"</div>";
                code_list.push(c);
            }
            h += "</td></tr>";
        }
        h += "</table>";
        h += "</td></tr>";
    }
    h += "</table>";
    $("#key_set_list").html(h);
    // ドラッグできるようにする
    for (i in code_list) {
        c = code_list[i];
        $("#ks_"+c).draggable({
            "helper": "clone"
        });
    }
};

// オプションが有効か
aztool.on_i2coption = function(option_data) {
    // 有効でない場合
    if (option_data.enable == 0) return false;
    // それ以外は有効
    return true;
};

// キーボタンをクリック
aztool.key_btn_click = function(div_id) {
    let key_id = aztool.get_key_id(div_id);
    if (aztool.setmap_stat == 0) {
        // キー設定モーダル表示
        aztool.keyact_open(key_id);
    } else if (aztool.setmap_stat == 4) {
        // アクチュエーションポイント設定中
        aztool.actuation_key_select(div_id, key_id);
    }
};


// キーレイアウトを表示
aztool.view_key_layout = function() {
    let h = "";
    let i, j, l, o, s;
    let kle = "";
    let cnf = 44;
    let pos = (aztool.setting_json_data.layout && aztool.setting_json_data.layout.position)? aztool.setting_json_data.layout.position: null;
    var mw = "970px", mh = "600px";
    // スマホの場合のモーダルのサイズ
    if (aztool.is_vertical()) {
        mw = "90%";
        mh = "80%";
        cnf = 100; // １キーのサイズ
    }
    // キー配列を表示する枠を表示
    h += "<div id='odiv_0' style='position: relative; top: 250px; display: inline-block;'></div>"; // 本体のキー配列用
    for (i in aztool.setting_json_data.i2c_option) {
        o = aztool.setting_json_data.i2c_option[i];
        if (!aztool.on_i2coption(o)) continue; // 有効でないオプションは無視
        h += "<div id='odiv_"+o.id+"' style='position: relative; display: inline-block;'></div>"; // オプションのキー配列用
    }
    h += "<table style='width: "+mw+";'><tr><td align='left' valign='top'>";
    h += "<div id='layer_title_info' class='layer_title'>レイヤー名</div>";
    h += "</td><td align='right'  valign='top'>";
    h += "<select id='lang_select' style='width: 170px; margin: 14px 0; font-size: 15px; padding: 6px 20px;' onChange='aztool.change_language();'>";
    h += "<option value='0'>日本語</option>";
    h += "<option value='1'>英語</option>";
    h += "</select>";
    h += "</td></tr></table>";
    $("#key_layout_box").html(h);
    // 言語SELECTを選択
    $("#lang_select").val(aztool.setmap_language);
    // キー配列を表示
    aztool.key_layout_data = [];
    // 本体のキー配列を表示
    kle = aztool.get_main_kle(); // 本体のKLE文字列取得
    if (kle) {
        aztool.key_layout_data.push({
            "option": {"id": 0, "map_start": 0},
            "kle": aztool.kle_view(kle, "#odiv_0", false, cnf, "sw_0_")
        });
        $("#odiv_0_title").html("本体");
    }
    // オプションのキー配列を表示
    for (i in aztool.setting_json_data.i2c_option) {
        o = aztool.setting_json_data.i2c_option[i];
        if (!aztool.on_i2coption(o)) continue; // 有効でないオプションは無視
        if (!aztool.i2c_option_data["o"+o.id]) continue; // KLEが無いオプションは無視
        aztool.key_layout_data.push({
            "option": aztool.setting_json_data.i2c_option[i],
            "kle": aztool.kle_view(aztool.i2c_option_data["o"+o.id], "#odiv_"+o.id, false, cnf, "sw_" + o.id + "_")
        });
        $("#odiv_"+o.id+"_title").html(aztool.get_opt_name(o.type) + " ["+o.id+"]");
    }
    // それぞれのオプションをドラッグで移動できるようにする
    for (i in aztool.key_layout_data) {
        o = aztool.key_layout_data[i].option;
        $("#odiv_"+o.id).draggable({
            "distance": 10, // ドラッグ開始までの移動距離
            "containment": "#key_layout_box", // 移動範囲指定用の親要素
            "scroll": false, // 見えない所へは持って行けないようにする
            "stop": function(event, ui) { // ドラッグ終了
                // ドラッグが終わった時間を記録(クリックイベントとかぶらないよう時間で判定するため)
                aztool.setmap_dragg_last_time = aztool.millis();
                // 設定データに移動した位置を反映
                if (!aztool.setting_json_data.layout) aztool.setting_json_data.layout = {};
                if (!aztool.setting_json_data.layout.position) aztool.setting_json_data.layout.position = {};
                let s = event.target.id.split("_");
                aztool.setting_json_data.layout.position["o_" + s[1]] = ui.position;
            }
        });
    }
    // ボタンのクリックイベント
    for (i in aztool.key_layout_data) { // kleのデータループ
        s = aztool.key_layout_data[i].kle;
        o = aztool.key_layout_data[i].option;
        for (j in s.keys) { // kle のキー分ループ
            // ボタンのhover時のマウスカーソルをポインタにする
            $("#sw_"+o.id+"_"+j).css({"cursor": "pointer"});
            // ボタンにクリックイベント登録
            $("#sw_"+o.id+"_"+j).click(function(e) {
                // ドラッグ処理から10ミリ秒以下ならばドラッグ処理でのクリックなので何もしない
                if ((aztool.millis() - aztool.setmap_dragg_last_time) < 10) {
                    return;
                }
                // クリックされたdivのid取得
                let t = (e.target.id)? e.target.id: e.currentTarget.id;
                // クリックしたボタンのキー設定
                aztool.key_btn_click(t);
            });
            // ボタンをドロップボックスにする(コードリストからドラッグしてきたコードを受け取る用)
            $("#sw_"+o.id+"_"+j).droppable({
                "drop": function(event, ui) { // アイテムをドロップされた
                    let s = ui.draggable[0].id.split("_"); // idにks_00 が入って来る
                    if (s[0] != "ks") return; // キーコード以外のドラッグは無視
                    let hid = parseInt(s[1]);
                    let k = aztool.get_key_id($(this).attr("id"));
                    console.log(aztool.setmap_select_layer + "[" + k + "] = " + hid);
                    // 入力データを設定
                    let sl = aztool.setmap_select_layer; // 選択中のレイヤーのキー名
                    let input_key = aztool.get_key_data(2, hid); // 押されたキーの情報を取得
                    aztool.setting_json_data.layers[sl].keys[k] = aztool.setmap_create_one_key_data(input_key);
                    // ボタンの文字と色を更新
                    aztool.setmap_key_string_update();
                },
                "over": function(event, ui) { // ドラッグしたアイテムが重なった時
                    let s = ui.draggable[0].id.split("_"); // idにks_00 が入って来る
                    if (s[0] != "ks") return; // キーコード以外のドラッグは無視
                    $(this).css({"background-color": "#979797"});
                },
                "out": function(event, ui) { // ドラッグしたアイテムが離れた時
                    let s = ui.draggable[0].id.split("_"); // idにks_00 が入って来る
                    if (s[0] != "ks") return; // キーコード以外のドラッグは無視
                    $(this).css({"background-color": aztool.key_color});
                }
            });
        }
    }
    // それぞれの表示位置を保存されていた位置に移動
    for (i in aztool.key_layout_data) {
        o = aztool.key_layout_data[i].option;
        l = "o_" + o.id;
        if (pos && pos[l] && pos[l].top && pos[l].left) {
            $("#odiv_"+o.id).css({"top": pos[l].top, "left": pos[l].left});
        } else {
            $("#odiv_"+o.id).css({"top": 250, "left": 500}); // デフォルト位置は中央
        }
    }
    // レイヤー名のドロップダウン表示非表示イベント
    $("#layer_title_info").hover(function(){
        $("#layer_menu_list").show();
    }, function(){
        $("#layer_menu_list").hide();
    });
};

// キーボードのlanguage変更
aztool.change_language = function() {
    // 言語を変更
    aztool.setmap_language = parseInt($("#lang_select").val());
    // ボタンに設定されている文字を表示
    aztool.setmap_key_string_update();
    // 設定用キーコードリスト表示
    aztool.key_set_list_init();
};

// レイアウト設定を探して返す
aztool.setmap_get_layout_data = function(optid) {
    let i;
    for (i in aztool.key_layout_data) {
        if (aztool.key_layout_data[i].option.id == optid) {
            return aztool.key_layout_data[i];
        }
    }
    return false;
};

// スイッチdivのID(sw_0_0)からキーのID(key_0)を取得
aztool.get_key_id = function(div_id) {
    let s = div_id.split("_"); // setmap_setting_one_target に sw_0_0 が入ってる
    let ms = 0; // マッピングスタートの位置
    let i, label_str;
    // 本体のキーだった場合
    if (s[1] == "0") {
        label_str = $("#" + div_id).attr("data_label");
        if (aztool.is_num(label_str)) {
            return "key_" + label_str; // ラベルが数字ならばラベルをキーIDとして利用
        } else {
            return "key_" + s[2]; // 分からんラベルが入ってたらKLEの番号をキーIDとして利用
        }
    }
    // i2cオプションだった場合
    for (i in aztool.setting_json_data.i2c_option) { // 該当のオプションを探す
        if (aztool.setting_json_data.i2c_option[i].id == s[1]) {
            ms = aztool.setting_json_data.i2c_option[i].map_start; // 該当のオプションのマッピングスタート位置を取得
            break;
        }
    }
    // keyidの番号を計算して返す
    return "key_" + (ms + parseInt(s[2]));
};

// 指定したレイヤー番号のレイヤー名を取得する
aztool.setmap_get_layer_name = function(layer_num) {
    if (!aztool.setting_json_data.layers["layer_" + layer_num]) return "";
    return aztool.setting_json_data.layers["layer_" + layer_num].name;
};

// 選択してるレイヤーの設定をボタンに表示する
aztool.setmap_key_string_update = function() {
    let d, h, i, j, k, l, o, s;
    let str;
    l = aztool.setmap_select_layer; // 選択中のレイヤーのキー名
    d = aztool.setting_json_data.layers[l]; // 選択レイヤーの設定されている情報
    // ボタンに文字を表示
    for (i in aztool.key_layout_data) { // kleのデータループ
        s = aztool.key_layout_data[i].kle;
        o = aztool.key_layout_data[i].option;
        for (j in s.keys) { // kle のキー分ループ
            str = "&nbsp;"; // 表示文字のデフォルトは空
            k = aztool.get_key_id("sw_"+o.id+"_"+j); // 設定JSON上で設定されてるkey_{n}の番号
            if (d.keys[k]) { // 設定がある
                str = aztool.setmap_get_key_string(d.keys[k]);
            }
            // 設定文字を反映
            $("#sw_"+o.id+"_"+j).html(str); // ボタンに文字を表示
            $("#sw_"+o.id+"_"+j).css({"background-color": aztool.key_color}); // ボタンの色もデフォルトに
        }
    }
    // レイヤー名の更新
    h = "<div id='layer_menu_top' class='layer_title_name'>" + d.name + "</div>";
    if (Object.keys(aztool.setting_json_data.layers).length > 1) { // レイヤーが2個以上あればドロップダウンリスト追加
        h += "<div id='layer_menu_list' class='layer_title_menu'>";
        h += "<ul>";
        for (k in aztool.setting_json_data.layers) {
            s = (k == l)? " style='background-color: #aed4ff;'": ""; // 選択中のレイヤーは色を変える
            o = (k == "layer_" + aztool.setting_json_data.default_layer)? " <font style='font-size: 11px;'>デフォルト</font>": ""; // デフォルトのレイヤーはデフォルト文字追加
            h += "<li id='layer_menu_item_"+k+"'"+s+">"+aztool.setting_json_data.layers[k].name+ o +"</li>";
        }
        h += "</ul>";
        h += "</div>";
    }
    $("#layer_title_info").html(h);
    if (Object.keys(aztool.setting_json_data.layers).length > 1) { // レイヤーが2個以上あればドロップダウン動作追加
        for (k in aztool.setting_json_data.layers) {
            $("#layer_menu_item_"+k).click(function(e){
                let tid = (e.target.id)? e.target.id: e.currentTarget.id;
                let s = tid.split("_");
                aztool.setmap_select_layer = s[3] + "_" + s[4];
                aztool.setmap_key_string_update();
            });
        }
    }
    // 設定内容が変更されていれば保存ボタン表示
    if (JSON.stringify(aztool.setting_json_data) != aztool.setting_json_txt) {
        $("#save_btn_box").html("<div class='menu_save_button' onClick='javascript:aztool.save();'>保存</div>");
    }
};

// キーデータから表示用の文字取得
aztool.setmap_get_key_string = function(key_data) {
    let i, d;
    let k = key_data.press;
    let r = "&nbsp;";
    if (k.action_type == 1) {
        // 通常入力
        r = "";
        for (i in k.key) {
            if (parseInt(i)) r += " + "
            d = aztool.get_key_data(2, k.key[i]); // hid コードからキーデータ取得
            r += d.str;
        }
    } else if (k.action_type == 2) {
        // テキスト入力
        r = "text";

    } else if (k.action_type == 3) {
        // レイヤー切り替え
        r = "layer";

    } else if (k.action_type == 4) {
        // WEBフック
        r = "WEB";

    } else if (k.action_type == 5) {
        // マウス移動
        r = "mouse";
 
    } else if (k.action_type == 10) {
        // マウス移動
        r = "analog<br>mouse";

    } else if (k.action_type == 11) {
        // Nubkey 位置設定
        r = "Nubkey<br>調節";

    }
    return "<table cellpadding='0' cellspacing='0' style='user-select: none; width: 100%; height: 100%;font-size: 12px;'><tr><td align='center'>" + r + "</td></tr></table>";
};

// キーマップ一括登録開始
aztool.setmap_all_set = function() {
    // 他の設定動作中であれば無視
    if (aztool.setmap_stat != 0) return;
    // 一括登録スタート
    aztool.setmap_stat = 1;
    // 設定インデックスリセット
    aztool.setmap_all_index = 0;
    // 設定データを入れる所
    aztool.setmap_all_set_data = {};
    // キーダウンイベント登録
    document.body.addEventListener("keydown", aztool.setmap_all_set_keydown, false);
    // キーに色を付ける
    aztool.setmap_all_set_view();
    // info表示
    $("#setmap_info").html("登録したいキーを押して下さい。");

};

// 一括設定の表示処理
aztool.setmap_all_set_view = function() {
    let i, j, o, p, s;
    p = 0;
    for (i in aztool.key_layout_data) {
        s = aztool.key_layout_data[i].kle;
        o = aztool.key_layout_data[i].option;
        for (j in s.keys) {
            if (p == aztool.setmap_all_index) {
                $("#sw_"+o.id+"_"+j).css({"background-color": aztool.select_key_color}); // 選択して欲しいキー
            } else if (p < aztool.setmap_all_index) {
                $("#sw_"+o.id+"_"+j).css({"background-color": aztool.enable_key_color}); // 選択が終わったキー
            } else {
                $("#sw_"+o.id+"_"+j).css({"background-color": aztool.key_color}); // まだ読み込んでいないキー
            }
            p++;
        }
    }
};

// 1キーの入力データ作成
aztool.setmap_create_one_key_data = function(keycode_data) {
    if (keycode_data.hid) {
        return {
            "press":{
                "action_type":1,
                "key":[keycode_data.hid]
            }
        };
    } else {
        return {
            "press":{
                "action_type":0
            }
        };
    }
};

// キーマップ一括登録表示
aztool.setmap_all_set_keydown = function(e) {
    let f, i, j, k, o, p, s, str;
    let input_key = aztool.get_key_data(3, e.keyCode); // 押されたキーの情報を取得
    console.log(input_key);
    p = 0;
    f = false;
    for (i in aztool.key_layout_data) {
        s = aztool.key_layout_data[i].kle;
        o = aztool.key_layout_data[i].option;
        for (j in s.keys) {
            if (p == aztool.setmap_all_index) {
                k = o.map_start + parseInt(j);
                aztool.setmap_all_set_data["key_" + k] = aztool.setmap_create_one_key_data(input_key); // 入力データを追加
                str = aztool.setmap_get_key_string(aztool.setmap_all_set_data["key_" + k]); // 表示用の文字取得
                $("#sw_"+o.id+"_"+j).html(str); // ボタンに文字を表示
                str = p + " - " + k + " - " + input_key.str + "<br>";
                str += "<a href='#' onClick='javascript:aztool.setmap_all_set_keydown_back();'>ひとつ前のボタンに戻る</a><br>";
                str += "<a href='#' onClick='javascript:aztool.setmap_all_set_keydown_cancel();'>キャンセル</a><br><br>";
                $("#setmap_info").html(str); // インフォメーションに設定内容を表示
                f = true;
            }
            p++;
        }
    }
    aztool.setmap_all_index++;
    // キーに色を付ける
    aztool.setmap_all_set_view();
    // 全てのキー設定完了
    if (p <= aztool.setmap_all_index) {
        console.log(aztool.setmap_all_set_data);
        // 一括登録終了
        aztool.setmap_stat = 0;
        $("#setmap_info").html("完了");
        // キーダウンイベント削除
        document.body.removeEventListener("keydown", aztool.setmap_all_set_keydown, false);
        // 設定データに追加
        k = aztool.setmap_select_layer; // 選択中のレイヤーのキー名
        aztool.setting_json_data.layers[k].keys = aztool.setmap_all_set_data; // 設定データのレイヤーを変更
        // ボタンの文字と色を更新
        aztool.setmap_key_string_update();
    }
    // キーの入力をキャンセル
    e.stopPropagation();
    e.preventDefault();
    return false;
};

// ひとつ前のボタンに戻る
aztool.setmap_all_set_keydown_back = function() {
    aztool.setmap_all_index--;
    // キーに色を付ける
    aztool.setmap_all_set_view();
};

// 一括登録キャンセル
aztool.setmap_all_set_keydown_cancel = function() {
        // 一括登録終了
        aztool.setmap_stat = 0;
        $("#setmap_info").html("");
        // キーダウンイベント削除
        document.body.removeEventListener("keydown", aztool.setmap_all_set_keydown, false);
        // ボタンの文字と色を更新
        aztool.setmap_key_string_update();
};

// コピーしたレイヤーを作成
aztool.setmap_layer_copy = function() {
    let i, k;
    for (i=0; i<100; i++) {
        // 空いているレイヤー番号を探す
        k = "layer_" + i;
        if (!aztool.setting_json_data.layers[k]) {
            // 今のレイヤーをコピーする
            aztool.setting_json_data.layers[k] = aztool.clone(aztool.setting_json_data.layers[aztool.setmap_select_layer]);
            // 名前に[copy]を追加
            aztool.setting_json_data.layers[k].name += "copy";
            // 選択中のレイヤーを新しいレイヤーにする
            aztool.setmap_select_layer = k;
            // 新しいレイヤーで表示を更新
            aztool.setmap_key_string_update();
            return;
        }
    }
};

// レイヤー設定
aztool.setmap_layer_set = function() {
    // レイヤー編集用のデータ用意
    aztool.setmap_layer_edit_data = aztool.clone(aztool.setting_json_data.layers);
    // 選択中のレイヤー
    aztool.setmap_layer_edit_select = "";
    // デフォルトのレイヤー
    aztool.setmap_layer_edit_default = aztool.setting_json_data.default_layer;
    // レイヤーリストを更新
    aztool.setmap_layer_list_update();
    // レイヤーモーダルを開く
    aztool.setmap_layer_mdl.open();

};

// レイヤーリストを更新
aztool.setmap_layer_list_update = function() {
    let d, k, h = "", s;
    // $("#layer_list").destroy();
    // リストアイテムを生成しなおす
    for (k in aztool.setmap_layer_edit_data) {
        s = k.split("_");
        d = (aztool.setmap_layer_edit_default == parseInt(s[1]))? " <font style='color: #a2a2a2;font-size: 12px;margin: 5px;'>デフォルト</font>": "";
        h += "<li id='list_"+k+"'>" + aztool.setmap_layer_edit_data[k].name + d + "</li>";
    }
    $("#layer_list").html(h);
    // アイテムクリックイベント登録
    $("#layer_list li").click(aztool.setmap_layer_item_click);
    // 選択状態の確認
    if (aztool.setmap_layer_edit_select) {
        // 選択してるアイテムがあれば選択状態にしてフォームも表示
        aztool.setmap_layer_item_click({"target": {"id": "list_" + aztool.setmap_layer_edit_select}});
    } else {
        // 選択してるアイテムが無ければ編集フォーム非表示
        $("#layer_edit_form").hide();

    }
};

// レイヤーアイテムクリック
aztool.setmap_layer_item_click = function(e) {
    let tid = (e.target.id)? e.target.id: e.currentTarget.id;
    let s = tid.split("_");
    let lid = s[1] + "_" + s[2];
    // 選択レイヤーにキーを設定(既に選択中のレイヤーなら選択を外す)
    aztool.setmap_layer_edit_select = (aztool.setmap_layer_edit_select == lid)? "": lid;
    // アイテムの色を変える
    let k;
    for (k in aztool.setmap_layer_edit_data) {
        if (k == aztool.setmap_layer_edit_select) {
            $("#list_" + k).css({"background-color": "#aed4ff"});
        } else {
            $("#list_" + k).css({"background-color": "#e1efff"});
        }
    }
    // フォームに内容を入れる
    if (aztool.setmap_layer_edit_select == "") {
        // 選択が無ければフォーム表示
        $("#layer_edit_form").hide();
    } else {
        $("#layer_num_edit").val(s[2]);
        k = (aztool.setmap_layer_edit_select)? aztool.setmap_layer_edit_data[aztool.setmap_layer_edit_select].name: "";
        $("#layer_name_edit").val(k);
        $("#layer_edit_form_info").html("");
        // フォーム表示
        $("#layer_edit_form").show();
    }

};

// レイヤー追加
aztool.setmap_layer_add_btn_click = function() {
    let k, m = -1;
    // 空いてるレイヤ番号を探す
    for (k=0; k<100; k++) {
        if (!aztool.setmap_layer_edit_data["layer_"+k]) {
            m = k;
            break;
        }
    }
    // 空いてるレイヤーが無ければ追加しない
    if (m < 0) return;
    // 空のレイヤーを追加
    aztool.setmap_layer_edit_data["layer_" + m] = {"name": "レイヤー" + m, "keys": {}};
    // レイヤーリストを更新
    aztool.setmap_layer_list_update();
    // セレクトレイヤーを追加したレイヤーにする
    aztool.setmap_layer_item_click({"target": {"id": "list_layer_" + m}});
};

// レイヤー削除
aztool.setmap_layer_delete_btn_click = function() {
    if (!aztool.setmap_layer_edit_select) return; // 選択レイヤーが無い
    // レイヤーが1つしかない場合は消さない
    if (Object.keys(aztool.setmap_layer_edit_data).length <= 1) return;
    // デフォルトレイヤーかどうか
    let dlf = (aztool.setmap_layer_edit_select == "layer_" + aztool.setmap_layer_edit_default);
    // レイヤーの削除
    delete aztool.setmap_layer_edit_data[aztool.setmap_layer_edit_select];
    aztool.setmap_layer_edit_select = "";
    // デフォルトレイヤーの削除だった場合1番目をデフォルトレイヤーにする
    let k, s;
    for (k in aztool.setmap_layer_edit_data) {
        s = k.split("_");
        aztool.setmap_layer_edit_default = parseInt(s[1]);
        break;
    }
    // リストの表示を更新
    aztool.setmap_layer_list_update();
};

// 選択中のレイヤーをデフォルトのレイヤーにする
aztool.setmap_layer_default_layer_set = function() {
    // 選択中のレイヤーをデフォルトレイヤーにする
    let s = aztool.setmap_layer_edit_select.split("_");
    aztool.setmap_layer_edit_default = parseInt(s[1]);
    // 選択レイヤーをクリア
    aztool.setmap_layer_edit_select = "";
    // リストの表示を更新
    aztool.setmap_layer_list_update();
};

// レイヤーの情報を反映をクリック
aztool.setmap_layer_form_save = function() {
    // レイヤーの番号が数値かどうか
    let lno = $("#layer_num_edit").val();
    if (!aztool.is_num(lno)) {
        $("#layer_edit_form_info").html("レイヤー番号は数字を入力して下さい。");
        return;
    }
    // レイヤー番号の最大値は99
    let lno_num = parseInt(lno);
    if (lno_num > 99) {
        $("#layer_edit_form_info").html("レイヤー番号は99以下を入力して下さい。");
        return;
    }
    // レイヤー名の文字列は12文字まで
    let lname = $("#layer_name_edit").val();
    if (lname.length > 12) {
        $("#layer_edit_form_info").html("レイヤー名が長すぎます。");
        return;
    }
    // レイヤーの番号が変わっていた場合
    let lid_new = "layer_" + lno;
    if (aztool.setmap_layer_edit_select != lid_new) {
        // 既に存在する番号だった
        if (aztool.setmap_layer_edit_data[lid_new]) {
            $("#layer_edit_form_info").html("既に使用されているレイヤー番号です。");
            return;
        }
        // 新しいレイヤーIDにデータをコピーして古いレイヤーIDを削除
        aztool.setmap_layer_edit_data[lid_new] = aztool.setmap_layer_edit_data[aztool.setmap_layer_edit_select];
        delete aztool.setmap_layer_edit_data[aztool.setmap_layer_edit_select];
        // デフォルトのレイヤーだった場合デフォルトレイヤの番号も変更
        if (aztool.setmap_layer_edit_select == "layer_" + aztool.setmap_layer_edit_default) {
            aztool.setmap_layer_edit_default = lno_num;
        }
    }
    // レイヤー名を更新
    aztool.setmap_layer_edit_data[lid_new].name = lname;
    // 選択レイヤーをクリア
    aztool.setmap_layer_edit_select = "";
    // リストの表示を更新
    aztool.setmap_layer_list_update();
};

// レイヤー設定閉じる動作 end_type = 1.保存 0.キャンセル
aztool.setmap_layer_edit_close = function(end_type) {
    if (end_type) {
        // 保存なら編集配列を元データに反映
        aztool.setting_json_data.layers = aztool.setmap_layer_edit_data; // レイヤーデータ
        aztool.setting_json_data.default_layer = aztool.setmap_layer_edit_default; // デフォルトレイヤー
    }
    // レイヤーモーダルを閉じる
    aztool.setmap_layer_mdl.close();
    // キー配列の表示を描きなおす
    aztool.view_setmap();
};
