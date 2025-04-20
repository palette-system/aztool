
// モーダルのオプション
window.REMODAL_GLOBALS = {
    "closeOnOutsideClick": false,
    "hashTracking": false
};

if (!window.aztool) aztool = {};

// KLEデータのファイルパス
aztool.kle_json_path = "/kle.json";

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

// ファームウェアの情報
aztool.firm_info = {"version": "000000", "eep_data": "AZC000"};

// aztool初期化
aztool.init = function(webhid_opt) {
    // webhidオブジェクト初期化
    webhid.init({
        "info_div": "console_div",
        "connect_func": null, // 再接続した時のイベント
        "disconnect_func": aztool.hid_disconn_func // 接続が切れた時のイベント
    });
    // IOエキスパンダ ピン設定モーダルの初期化
    pinstp.init();
    // I2Cアドレス設定モーダルの初期化
    aztool.stpaddr.init();
    // 共通ライブラリの初期化
    aztool.util_init();
    // キー設定ページの初期化
    aztool.setmap_init();
    // キー動作設定用のモーダル初期化
    aztool.keyact_init();
    // 接続ページを表示
    aztool.view_connect_top();
    // シリアル通信(赤外線)動作テスト用のモーダル初期化
    aztool.irtest_init();
};


// キーボードに接続
aztool.connect = function(set_step=null) {
    // ロードステップ設定
    if (set_step) webhid.load_step = set_step;
    // コネクション開始
    webhid.connect(function(stat) {
        // コネクション失敗
        if (stat != 0) {
            aztool.view_connect_top("接続できませんでした。"); // 接続ページを表示
            return;
        }
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
    aztool.view_connect_top("切断しました");
};

// データのロードページ表示
aztool.view_load_page = function() {
    $("#main_box").html("<div id='console_div'></div>");
};

// 使用可能かどうか
aztool.check_device = function() {
    if (webble.webble_mode) {
        // WEB Bluetooth モード
        if (!aztool.is_mobile()) {
            // スマホ以外
            if (!aztool.is_chrome()) return false; // Chrome以外は未対応
        }
        // スマホはとりあえず何でもOK
    } else {
        // WEB HID モード
        if (aztool.is_mobile()) return false; // スマホは未対応
        if (!aztool.is_chrome()) return false; // Chrome以外は未対応
    }
    return true;
};

// コネクションページ表示
aztool.view_connect_top = function(msg) {
    let i;
    let h = "";
    h += "<div style='text-align: center; margin: 100px 0;'>";
    h += "<h2 style='font-size: 80px; margin: 40px 0 100px 0;'>⌨ AZTOOL</h2>";
    if (!aztool.check_device()) {
        h += "<div style='font-size: 20px;'>※ PC Chrome で開いて下さい。</div>";
        h += "<div style='font-size: 20px;'>"+navigator.userAgent+"</div>";

    } else {
        h += "<font style='font-size: 16px;'>転送速度</font>　<select id='load_step_select' style='font-size: 16px; width: 100px; text-align: center; padding: 4px;'>";
        for (i=1; i<=16; i++) {
            h += "<option value='"+i+"'>"+i+"</option>";
        }
        h += "</select><br><br>";
        h += "<div class='conn_bbutton' onClick='javascript:aztool.connect($(\"#load_step_select\").val());'>キーボードに接続</div>";
        h += "<br>";
        if (msg) h += "<br>" + msg;
    }
    h += "<div style='margin: 140px 0 0 0;'>";
    h += "<img style='width: 147px; height: 147px;' src='./img/logo2.jpg' alt='パレットシステム'>"
    h += "</div>";
    h += "</div>";
    $("#main_box").html(h);
    $("#load_step_select").val(webhid.load_step + "");
};

// トップメニューの表示
aztool.view_top_menu = function() {
    let k = aztool.setting_json_data;
    let h = "";
    let x, t, tm;
    let kname = (k.keyboard_name)? k.keyboard_name: k.keyboard_type;
    h += "<center>";
    h += "<table><tr><td colspan='2'>";
    h += "<h2 style='font-size: 50px; margin: 16px 0;'>⌨ AZTOOL</h2>";
    h += "</td></tr>";
    h += "<tr><td valign='top' align='center'>";
    h += "<div style='text-align: left; display: inline-block; margin: 0 0 40px 0;'>";
    h += "<table cellpadding='4' cellspacing='0' border='0' class='keystatus'>";
    h += "<tr><th>VendorId / ProductId</th><td>" + k.vendorId + " / " + k.productId + "</td></tr>";
    h += "<tr><th>キーボード名</th><td>" + kname + "</td></tr>";
    x = [];
    if (k.keyboard_pin.row && k.keyboard_pin.row.length) x.push("row = " + k.keyboard_pin.row.join(","));
    if (k.keyboard_pin.col && k.keyboard_pin.col.length) x.push("col = " + k.keyboard_pin.col.join(","));
    if (k.keyboard_pin.ioxp && k.keyboard_pin.ioxp.length) x.push("ioxp = " + k.keyboard_pin.ioxp.join(","));
    if (k.keyboard_pin.direct && k.keyboard_pin.direct.length) x.push("direct = " + k.keyboard_pin.direct.join(","));
    if (k.keyboard_pin.hall && k.keyboard_pin.hall.length) x.push("hall = " + k.keyboard_pin.hall.join(","));
    h += "<tr><th>キーピン</th><td>"+x.join("　")+"</td></tr>";
    console.log(k);
    if (k.i2c_set && k.i2c_set.length == 3) {
        h += "<tr><th>I2Cピン</th><td>SDA= " + k.i2c_set[0] + " / SCL= " + k.i2c_set[1] + " / " + k.i2c_set[2].toLocaleString() + " Hz</td></tr>";
    } else {
        h += "<tr><th>I2Cピン</th><td>　</td></tr>";
    }
    if (k.seri_set && k.seri_set.length == 4) {
        t = (k.seri_set[3])? " / 反転": "";
        h += "<tr><th>シリアル(赤外線)ピン</th><td>RX= " + k.seri_set[0] + " / TX= " + k.seri_set[1] + " / " + k.seri_set[2].toLocaleString() + " Hz" + t + "</td></tr>";
    } else {
        h += "<tr><th>シリアル(赤外線)ピン</th><td>　</td></tr>";
    }
    h += "<tr><th>ディスク使用量</th><td> " + aztool.disk_data.used.toLocaleString() + " / " + aztool.disk_data.total.toLocaleString() + " </td></tr>";
    t = " style='font-size: 40px; margin: 0 0 16px 0; display: block; height: 70px; line-height: 70px;'";
    tm = " style='font-size: 40px; margin: 0 0 16px 0; display: block; height: 50px; line-height: 70px;'";
    h += "</table>";
    h += "</div>";

    h += "<div>";
    h += "<div class='conn_bbutton' onClick='javascript:aztool.close();'>閉じる</div>";
    if (JSON.stringify(aztool.setting_json_data) != aztool.setting_json_txt) { // 設定内容が変更されていれば保存ボタン表示
        h += "<br><br><div class='save_button' onClick='javascript:aztool.save();'>保存</div>";
    }
    h += "</div>";

    h += "</td><td valign='top'>";
    h += "<div style='width: 900px; margin: -10px 0;'>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.view_setmap();'><font "+t+">⌨</font>キーマップ</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.view_keytest();'><font "+t+">🩺</font>入力テスト</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.irtest_open();'><font "+t+">🚨</font>赤外線確認</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.view_setopt();'><font "+t+">🧩</font>オプション</div>";
    h += "<div class='topmenu_btn only_esp' onClick='javascript:aztool.view_wifi_top();'><font "+t+">📶</font>Wifi</div>";
    h += "<div class='topmenu_btn azdisp' onClick='javascript:aztool.view_setdispimg();'><font "+t+">🖥️</font>待受画像</div>";
    h += "<div class='topmenu_btn azcore' onClick='javascript:aztool.power_saving_setting_open();'><font "+t+">🔋</font>省電力</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.param_setting_open();'><font "+t+">🎛️</font>パラメータ</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.serial_setting_open();'><font "+t+">📍</font>シリアルピン</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.addopt_start(\"main_box\", 100);'><font "+tm+">🛠️</font>カスタム<br>レイアウト</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.edit_setting_json();'><font "+t+">📝</font>設定JSON</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.file_export_all();'><font "+t+">📤</font>エクスポート</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.file_import_modal_open();'><font "+t+">📥</font>インポート</div>";
    h += "<div class='topmenu_btn' onClick='javascript:aztool.setting_init();'><font "+t+">🧊</font>初期化</div>";
    
    h += "</div>";
    h += "</td></tr></table>";
    h += "</center>";
    $("#main_box").html(h);
    if (!aztool.is_azcore()) $(".azcore").css({"display": "none"}); // azcore専用の機能は他の機器の場合非表示
    if (aztool.get_disp_rotation() < 0) $(".azdisp").css({"display": "none"}); // azcore専用の機能は他の機器の場合非表示
    if (aztool.is_nrf52()) $(".only_esp").css({"display": "none"}); // nRF52系であればESP用のメニューを非表示にする

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
    // デフォルトフラグがあればフラグを削除
    if (aztool.is_default_setting()) {
        delete aztool.setting_json_data.default;
    }
    // 設定JSONデータ作成
    let save_data = JSON.stringify(aztool.setting_json_data);
    // 保存
    webhid.save_file(
        aztool.setting_json_path, // 保存先
        save_data, // 保存データ
        cb_func);
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
