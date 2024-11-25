// 省電力モードの設定

if (!window.aztool) aztool = {};

// 省電力モードの設定モーダルオープン
aztool.param_setting_open = function() {
    // モーダルを開く
    let h = "";
    h += "<div style='text-align: left;'>";
    h += "<h2>パラメータ設定</h2>";
    h += "<div id='param_setting_main_box' style='margin: 0;'>";

    // 基本設定
    h += "<div style='margin: 0;font-size: 20px;font-weight: bold;'>基本 設定</div>";
    h += "<table style='display: inline-block; font-size: 16px;'>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>キーボード名：</td><td>"
    h += "<input id='general_name' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 400px; text-align: left;'>";
    h += "</td></tr>";
    h += "</table>";
    h += "<br><br>";

    // tap /hold
    h += "<div style='margin: 0;font-size: 20px;font-weight: bold;'>tap / hold 設定</div>";
    h += "<table style='display: inline-block; font-size: 16px;'>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>ホールドタイプ：</td><td>"
    h += "<select id='hold_type' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 320px; text-align: left;'>";
    h += "<option value='0'>時間を超えたらhold押下</option>";
    h += "<option value='1'>押した直後にhold押下</option>";
    h += "</select>";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>hold までの時間：</td><td>"
    h += "<input id='hold_time' type='number' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 200px; text-align: center;'>";
    h += "</td></tr>";
    h += "</table>";

    h += "</div>";
    h += "<div id='saving_info' style='color: #ff5959;'></div>";
    h += "<div id='addap_btn_box' style='margin: 80px 0 0 0;'>";
    h += "<a href='#' class='cancel-button' onClick='javascript:aztool.param_saving_setting_close(0);'>キャンセル</a>";
    h += "　　　　<a class='exec-button' onClick='javascript:aztool.param_saving_setting_close(1);'>決定</a>";
    h += "</div>";
    h += "</div>";
    aztool.remodal_open(h); // モーダルオープン
    aztool.param_setting_set(); // 設定をフォームに反映
};

// 設定をフォームに入れる
aztool.param_setting_set = function() {
    let k;
    let hold_def = {"type": 1, "time": 45};
    let hold_set = (aztool.setting_json_data.hold)? aztool.clone(aztool.setting_json_data.hold): hold_def;
    // 項目が無い場合はデフォルトを指定
    for (k in hold_def) if (!(k in hold_set)) hold_set[k] = hold_def[k];
    // フォームに値を入れる
    $("#hold_type").val(hold_set.type + "");
    $("#hold_time").val(hold_set.time + "");
    $("#general_name").val(aztool.setting_json_data.keyboard_name + "");
};

// 省電力モードの設定モーダルを閉じる
aztool.param_saving_setting_close = function(save_flag) {
    // 決定が押された場合はフォームの入力内容を設定配列に反映
    if (save_flag) {
        // 基本設定
        aztool.setting_json_data.keyboard_name = $("#general_name").val();
        // tap / hold
        let hold_type = parseInt($("#hold_type").val());
        let hold_time = parseInt($("#hold_time").val());
        if (hold_time < 1 || hold_time > 255) {
            $("#saving_info").html("holdまでの時間は1-255で設定して下さい。");
            return;
        }
        aztool.setting_json_data.hold = {
            "type": hold_type,
            "time": hold_time
        };
    }
    aztool.remodal_close();
    // トップメニューを描画しなおす
    aztool.view_top_menu();
};

// シリアル通信設定モーダルオープン
aztool.serial_setting_open = function() {
    // モーダルを開く
    let h = "";
    h += "<div style='text-align: left;'>";
    h += "<h2>シリアル通信設定</h2>";
    h += "<div id='param_setting_main_box' style='margin: 0;'>";

    // I2C 設定
    h += "<div style='margin: 0;font-size: 20px;font-weight: bold;'>I2C 設定</div>";
    h += "<table style='display: inline-block; font-size: 16px;'>";
    h += "<tr><td style='font-size: 18px; text-align: left;'>"
    h += "SDA<input id='i2c_sda' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 100px; text-align: right;'>";
    h += "　　SCL<input id='i2c_scl' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 100px; text-align: right;'>";
    h += "　　<input id='i2c_hz' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 100px; text-align: right;'>Hz";
    h += "</td></tr>";
    h += "</table>";
    h += "<br><br>";
    h += "<br><br>";

    // シリアル通信(赤外線) 設定
    h += "<div style='margin: 0;font-size: 20px;font-weight: bold;'>シリアル通信(赤外線) 設定</div>";
    h += "<table style='display: inline-block; font-size: 16px;'>";
    h += "<tr><td style='font-size: 18px; text-align: left;'>"
    h += "TX<input id='seri_tx' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 100px; text-align: right;'>";
    h += "　　RX<input id='seri_rx' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 100px; text-align: right;'>";
    h += "　　<input id='seri_hz' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 100px; text-align: right;'>Hz";
    h += "</td></tr>";
    h += "</table>";
    h += "<br><br>";

    h += "</div>";
    h += "<div id='saving_info' style='color: #ff5959;'></div>";
    h += "<div id='addap_btn_box' style='margin: 80px 0 0 0;'>";
    h += "<a href='#' class='cancel-button' onClick='javascript:aztool.serial_saving_setting_close(0);'>キャンセル</a>";
    h += "　　　　<a class='exec-button' onClick='javascript:aztool.serial_saving_setting_close(1);'>決定</a>";
    h += "</div>";
    h += "</div>";
    aztool.remodal_open(h); // モーダルオープン
    if (aztool.setting_json_data.i2c_set && aztool.setting_json_data.i2c_set.length == 3) {
        $("#i2c_sda").val(aztool.setting_json_data.i2c_set[0]);
        $("#i2c_scl").val(aztool.setting_json_data.i2c_set[1]);
        $("#i2c_hz").val(aztool.setting_json_data.i2c_set[2]);
    }
    if (aztool.setting_json_data.seri_set && aztool.setting_json_data.seri_set.length == 3) {
        $("#seri_tx").val(aztool.setting_json_data.seri_set[0]);
        $("#seri_rx").val(aztool.setting_json_data.seri_set[1]);
        $("#seri_hz").val(aztool.setting_json_data.seri_set[2]);
    }
};

// 省電力モードの設定モーダルを閉じる
aztool.serial_saving_setting_close = function(save_flag) {
    var sda, scl, hz, tx, rx;
    // 決定が押された場合はフォームの入力内容を設定配列に反映
    if (save_flag) {
        // I2C設定
        sda = $("#i2c_sda").val();
        scl = $("#i2c_scl").val();
        hz = $("#i2c_hz").val();
        if (sda.length > 0 && scl.length > 0 && hz.length > 0) {
            aztool.setting_json_data.i2c_set = [parseInt(sda), parseInt(scl), parseInt(hz)];
        } else {
            aztool.setting_json_data.i2c_set = [];
            delete aztool.setting_json_data.i2c_set;
        }
        // シリアル通信(赤外線)
        tx = $("#seri_tx").val();
        rx = $("#seri_rx").val();
        hz = $("#seri_hz").val();
        if (tx.length > 0 && rx.length > 0 && hz.length > 0) {
            aztool.setting_json_data.seri_set = [parseInt(tx), parseInt(rx), parseInt(hz)];
        } else {
            aztool.setting_json_data.seri_set = [];
            delete aztool.setting_json_data.seri_set;
        }
    }
    aztool.remodal_close();
    // トップメニューを描画しなおす
    aztool.view_top_menu();
};
