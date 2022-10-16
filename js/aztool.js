
// モーダルのオプション
window.REMODAL_GLOBALS = {
    "closeOnOutsideClick": false,
    "hashTracking": false
};

if (!window.aztool) aztool = {};

// 設定JSONファイルのパス
aztool.setting_json_path = "/setting.json";

// 設定JSONのデータ
aztool.setting_json_txt = ""; // テキスト
aztool.setting_json_data = {}; // データ

// ロード用I2C用のインデックス
aztool.i2c_load_index = 0;
aztool.i2c_option_data = {};

aztool.step_max = 0;
aztool.step_index = 0; // 今のステップ

// aztool初期化
aztool.init = function() {
    // webhidオブジェクト初期化
    webhid.disconnect_func = aztool.hid_disconn_func; // 接続が切れた時のイベント
    webhid.init({"info_div": "console_div"});
    // ピン設定の初期化
    pinstp.init();
    // 共通ライブラリの初期化
    aztool.util_init();
    // キー設定ページの初期化
    aztool.setmap_init();
    // キー動作設定用のモーダル初期化
    aztool.keyact_init();
    // 接続ページを表示
    aztool.view_connect_top();
};


// キーボードに接続
aztool.connect = function() {
    // ロードステップ設定
    webhid.load_step = $("#load_step_select").val();
    // コネクション開始
    webhid.connect(function(stat) {
        // コネクション失敗
        if (stat != 0) {
            aztool.view_connect_top("接続できませんでした。"); // 接続ページを表示
            return;
        }
        // aztool.addopt_start("main_box"); // オプション追加
        // 接続成功したら設定JSON読み込み
        aztool.load_setting_json();
    });
};

// キーボード切断
aztool.close = function() {
    webhid.close(function() {
        aztool.view_connect_top("切断しました");
    });
};

// 接続が切れた時に呼び出される
aztool.hid_disconn_func = function(e) {
    // 接続ページを表示
    aztool.view_connect_top("切断しました " + aztool.to_hex(e.device.productId, 4) + " : " + aztool.to_hex(e.device.vendorId, 4));
};

// 設定JSONの読み込み
aztool.load_setting_json = function() {
    aztool.view_load_page(); // ロード画面表示
    webhid.get_file(aztool.setting_json_path, function(stat, load_data) {
        // 読み込み失敗
        if (stat != 0) return;
        // 読み込み成功したらデータを受けとる
        let txt = webhid.arr2str(load_data);
        aztool.setting_json_data = JSON.parse(txt); // 設定データパース
        aztool.setting_json_txt = JSON.stringify(aztool.setting_json_data); // 設定データテキスト
        console.log(aztool.setting_json_txt);
        console.log(aztool.setting_json_data);
        // 別で読み込みが必要なi2cオプションのデータをロード
        aztool.i2c_option_data = {};
        aztool.i2c_load_index = 0;
        aztool.load_i2c_data();
    });
};

// i2cデータのロード
aztool.load_i2c_data = function() {
    // i2cオプションのロード終わったらメニューを表示
    if (!aztool.setting_json_data.i2c_option || // i2cの設定が無い
        aztool.i2c_load_index >= aztool.setting_json_data.i2c_option.length) { // 全てロード完了
            // ディスクの空き容量取得
            webhid.get_disk_info(function(disk_data) {
                aztool.disk_data = disk_data;
                aztool.view_top_menu();
            })
            return;
    }
    // i2cのデータをロード
    let o = aztool.setting_json_data.i2c_option[ aztool.i2c_load_index ];
    let t;
    // IOエキスパンダ || I2Cロータリーエンコーダ
    if (o.type == 1 || o.type == 2) {
        // kleのJSONロード
        console.log("get_file: /o" + o.id);
        webhid.get_file("/o" + o.id, function(stat, load_data) {
            if (stat != 0) {
                // 読み込み失敗 空のデータを入れる
                aztool.i2c_option_data[ "o" + o.id ] = "[]";
            } else {
                // kleJSON取得
                aztool.i2c_option_data[ "o" + o.id ] = webhid.arr2str(load_data);
            }
            // 次のオプションを取得
            aztool.i2c_load_index++;
            aztool.load_i2c_data();
        });
        return;
    } else if (o.type == 3) {
        aztool.i2c_option_data[ "o" + o.id ] = "[\"\"]";
    }
    // 不明なオプションタイプ
    aztool.i2c_load_index++;
    aztool.load_i2c_data();
};

// データのロードページ表示
aztool.view_load_page = function() {
    $("#main_box").html("<div id='console_div'></div>");
};

// コネクションページ表示
aztool.view_connect_top = function(msg) {
    let i;
    let h = "";
    h += "<div style='text-align: center; margin: 100px 0;'>";
    h += "<h2 style='font-size: 80px; margin: 40px 0 100px 0;'>⌨ AZTOOL</h2>";
    if (aztool.is_mobile() || !aztool.is_chrome()) {
        h += "<div style='font-size: 20px;'>※ PC Chrome で開いて下さい。</div>";

    } else {
        h += "<font style='font-size: 16px;'>転送速度</font>　<select id='load_step_select' style='font-size: 16px; width: 100px; text-align: center; padding: 4px;'>";
        for (i=1; i<=16; i++) {
            h += "<option value='"+i+"'>"+i+"</option>";
        }
        h += "</select><br><br>";
        h += "<div class='conn_bbutton' onClick='javascript:aztool.connect();'>キーボードに接続</div>";
        h += "<br>";
        if (msg) h += "<br>" + msg;
    }
    h += "<div style='margin: 140px 0 0 0; height: 80px; line-height: 80px;'>";
    h += "<img src='./img/palette_system_logo.png' alt='パレットシステム'>"
    h += "</div>";
    h += "</div>";
    $("#main_box").html(h);
    $("#load_step_select").val(webhid.load_step + "");
};

// トップメニューの表示
aztool.view_top_menu = function() {
    let k = aztool.setting_json_data;
    let h = "";
    let x, t;
    let kname = (k.keyboard_name)? k.keyboard_name: k.keyboard_type;
    h += "<center>";
    h += "<h2 style='font-size: 50px; margin: 40px 0;'>⌨ AZTOOL</h2>";
    h += "<div style='text-align: left; display: inline-block; margin: 0 0 80px 0;'>";
    h += "キーボード情報<br>";
    h += "<table cellpadding='4' cellspacing='0' border='0' class='keystatus'>";
    h += "<tr><th>VendorId / ProductId</th><td>" + k.vendorId + " / " + k.productId + "</td></tr>";
    h += "<tr><th>キーボード名</th><td>" + kname + "</td></tr>";
    x = [];
    if (k.keyboard_pin.ioxp && k.keyboard_pin.ioxp.length) x.push("ioxp = " + k.keyboard_pin.ioxp.join(","));
    if (k.keyboard_pin.direct && k.keyboard_pin.direct.length) x.push("direct = " + k.keyboard_pin.direct.join(","));
    h += "<tr><th>キーピン</th><td>"+x.join("　")+"</td></tr>";
    console.log(k);
    if (k.i2c_set && k.i2c_set.length == 3) {
        h += "<tr><th>I2Cピン</th><td>SDA= " + k.i2c_set[0] + " / SCL= " + k.i2c_set[1] + " / " + k.i2c_set[2].toLocaleString() + " Hz</td></tr>";
    }
    h += "<tr><th>ディスク使用量</th><td> " + aztool.disk_data.used.toLocaleString() + " / " + aztool.disk_data.total.toLocaleString() + " </td></tr>";
    t = " style='font-size: 40px; margin: 0 0 16px 0; display: block; height: 70px; line-height: 70px;'";
    h += "</table>";
    h += "</div>";
    h += "<div style='width: 900px;'>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.view_setmap();'><font "+t+">⌨</font>キーマップ</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.view_keytest();'><font "+t+">🩺</font>入力テスト</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.view_setopt();'><font "+t+">🧩</font>I2C オプション</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.view_wifi_top();'><font "+t+">📶</font>Wifi</div>";
    h += "<div class='topmenu_btn azcore' onClick='javascript:aztool.power_saving_setting_open();'><font "+t+">🔋</font>省電力</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.edit_setting_json();'><font "+t+">📝</font>設定JSON</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.file_export_all();'><font "+t+">📤</font>エクスポート</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.file_import_modal_open();'><font "+t+">📥</font>インポート</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.setting_init();'><font "+t+">🧊</font>初期化</div>";
    
    h += "</div>";
    h += "<div style='margin: 100px 0 50px 0;'>";
    h += "<div class='conn_bbutton' onClick='javascript:aztool.close();'>閉じる</div>";
    if (JSON.stringify(aztool.setting_json_data) != aztool.setting_json_txt) { // 設定内容が変更されていれば保存ボタン表示
        h += "　　　　<div class='save_bbutton' onClick='javascript:aztool.save();'>保存して再起動</div>";
    }
    h += "</div>";
    h += "</center>";
    $("#main_box").html(h);
    if (!aztool.is_azcore()) $(".azcore").css({"display": "none"}); // azcore専用の機能は他の機器の場合非表示

    // キー配列を表示
    // aztool.view_key_layout();
};

// メッセージを表示
aztool.view_message = function(msg) {
    let h = "";
    h += "<div style='text-align: center; margin: 100px 0;'>";
    h += "<h2 style='font-size: 80px; margin: 40px 0 100px 0;'>⌨ AZTOOL</h2>";
    h += msg + "</div>";
    $("#main_box").html(h);
};

// キーボードを再起動
aztool.keyboard_restart = function(boot_type) {
    aztool.view_message("再起動します。");
    webhid.m5_restart(boot_type); // キーボードモードで再起動
};

// 設定JSON編集
aztool.edit_setting_json = function() {
    aztool.txtedit_setting_json_edit(function(stat, save_flag) {
        // 変更されていればキーボードを再起動
        if (save_flag) {
            aztool.keyboard_restart(0); // キーボードモードで再起動
            return;
        }
        aztool.view_top_menu();
    });
};

// 設定配列に反映した内容をJSONにして保存
aztool.setting_json_save = function(cb_func) {
    // 設定JSONデータ作成
    let save_data = JSON.stringify(aztool.setting_json_data);
    // 保存
    webhid.save_file(
        aztool.setting_json_path, // 保存先
        save_data, // 保存データ
        cb_func);
};

// オプションのステップ信仰の表示を更新する
aztool.update_step_box = function(step_num) {
    let i, c;
    aztool.step_index = step_num;
    for (i=1; i<=aztool.step_max; i++) {
        c = "option_step";
        if (step_num == i) {
            c += " step_selected";
        } else if (step_num > i) {
            c += " step_ended";
        }
        $("#stepbox_" + i).attr("class", c);
    }
};

// 設定を保存して再起動
aztool.save = function() {
    // 設定を保存
    aztool.view_message("<div id='save_info'>保存中</div><br><br><br><div id='console_div'></div>");
    aztool.setting_json_save(function(stat) {
        // 保存失敗
        if (stat != 0) {
            $("#save_info").html("設定JSONの保存に失敗しました。<br><br><br><br><div class='conn_bbutton' onClick='javascript:aztool.view_top_menu();'>戻る</div>");
            return;
        }
        // ちょっと待ってからキーボード再起動
        setTimeout(function() {
            aztool.keyboard_restart(0); // キーボードモードで再起動
        }, 500);
    });
};

// 設定を初期化
aztool.setting_init = function() {
    // 確認ウィンドウ表示
    aztool.confirm(
        "全ての設定を初期値に戻します。",
        function(stat) {
            if (stat == 1) {
                // はいを選ばれたら初期化
                aztool.view_message("設定をリセットしています。");
                webhid.all_remove(function() { // 全ファイル削除
                    // ちょっと待ってからキーボード再起動
                    setTimeout(function() {
                        aztool.keyboard_restart(0); // キーボードモードで再起動
                    }, 500);
                });
            }
        },
        {"yes": "初期化する", "no": "キャンセル"}
    );
};
