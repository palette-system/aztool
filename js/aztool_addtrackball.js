// トラックボール オプション追加ツール


if (!window.aztool) aztool = {};

// PIM447 の向きのタイプ
aztool.pim447_rotate_list = ["上", "右", "下", "左"];

// PIM447 1U トラックボールオプション追加開始
aztool.addpim447tb_start = function(opt_type) {
    // オプション設定
    aztool.option_add_type = opt_type;
    aztool.option_add_name = "";
    // HTML 作成
    aztool.addpim447tb_init_html();
    // データの準備
    aztool.step_max = 3;
    aztool.step_index = 0;
    aztool.option_add = {
        "id": "000000", // オプションごとのユニークなID
        "type": 3, // オプションのタイプ 3 = PIM447 1U トラックボール
        "enable": 1, // 有効かどうか 1=有効
        "addr": 10, // PIM447のアドレス(デフォルト0x0A)
        "rotate": 0, // 向き 0=上 1=右 2=下 3=左
        "speed": 120, // マウスの移動速度
        "read_cycle": 0, // 読み込みサイクル(ミリ秒)
        "speed_type": 2, // AZTOUCHスピード
        "drag_flag": 1, // AZTOUCHドラッグを有効化するか
        "map_start": 0, // キー設定の番号いくつからがこのオプションのキー設定か
        "map": [] // キーと読み込んだデータとのマッピング設定
    };
    // 設定画面表示
    aztool.addpim447tb_setiing_view();
};

// PIM447 1U 追加 用HTML作成
aztool.addpim447tb_init_html = function() {
    let html = `
    <div  style="width: 1200px;">
    <table style="width: 100%; height: 700px;"><tr><td valign="top" align="center" style="width: 270px; background-color: #f8f8f8; padding: 20px 0;">
    <table>
    <tr><td align="center"><div id="stepbox_1" class="option_step">設定</div></td></tr>
    <tr><td align="center"><div class="triangle_down"></div></td></tr>
    <tr><td align="center"><div id="stepbox_2" class="option_step">動作確認</div></td></tr>
    <tr><td align="center"><div class="triangle_down"></div></td></tr>
    <tr><td align="center"><div id="stepbox_3" class="option_step">完了</div></td></tr>
    </table>

    </td><td valign="top" style="padding: 20px;">
    <div id="pim447tb_setting_form">
    </div>

    </td></tr></table>

    </div>`;
    $("#" + aztool.addopt_div_id).html(html);
};

// PIM447 1U 設定
aztool.addpim447tb_setiing_view = function() {
    let st_th = "width: 200px;text-align: right; padding: 15px 20px;";
    let html = `
    <div style="font-size: 26px; color: black; background-color: #bde4ff; padding: 4px 20px;">PIM447 1U トラックボールの設定</div>
    <br>
    <table>
    <tr>
        <td style="`+st_th+`">アドレス</td>
        <td>0x <input type="text" id="pim447_addr" value="` + aztool.to_hex(aztool.option_add.addr, 2, "") + `" style="font-size: 26px; width: 80px;"></td>
    </tr>
    <tr id="tr_read_cycle">
        <td style="`+st_th+`">リードサイクル</td>
        <td><input type="text" id="pim447_read_cycle" value="` + aztool.option_add.read_cycle + `" style="font-size: 26px; width: 80px;"> ミリ秒</td>
    </tr>
    <tr id="tr_speed">
        <td style="`+st_th+`">スピード(倍率)</td>
        <td><input type="text" id="pim447_speed" value="` + aztool.option_add.speed + `" style="font-size: 26px; width: 80px;"> ％</td>
    </tr>
    <tr id="tr_speed_type" style='display: none;'>
        <td style="`+st_th+`">AZTOUCHスピード設定</td>
        <td><select id="pim447_speed_type" style="font-size: 26px; width: 80px;">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        </select></td>
    </tr>
    <tr id="tr_drag_flag" style='display: none;'>
        <td style="`+st_th+`">ドラッグ設定</td>
        <td><select id="pim447_drag_flag" style="font-size: 26px; width: 80px;">
        <option value="0">オフ</option>
        <option value="1">オン</option>
        </select></td>
    </tr>
    <tr>
        <td style="`+st_th+`">向き</td>
        <td><select id="pim447_rotate" style="font-size: 26px; width: 80px;">
        <option value="0">上</option>
        <option value="1">右</option>
        <option value="2">下</option>
        <option value="3">左</option>
        </select></td>
    </tr>
    </table>
    <br><br>
    <br><br>
    <div id="addpim447tb_info"></div>
    <div style="text-align: right; width: 800px;">
    <a class='cancel-button' onClick='javascript:aztool.option_add_end(aztool.view_setopt);'>キャンセル</a>
    　<a class="exec-button" onClick="javascript:aztool.addpim447tb_setiing_exec();">次へ</a>
    </div>
    `;
    $("#pim447tb_setting_form").html(html);
    if (aztool.option_add_type == 4) {
        $("#tr_speed").hide();
    }
    if (aztool.option_add_type == 9) { // AZTOUCH
        $("#tr_speed_type").show();
        $("#tr_drag_flag").show();
    }
    $("#pim447_rotate").val(aztool.option_add.rotate);
    $("#pim447_speed_type").val(aztool.option_add.speed_type);
    $("#pim447_drag_flag").val(aztool.option_add.drag_flag);
    aztool.update_step_box(1);
};

// PIM447 1U 設定 決定
aztool.addpim447tb_setiing_exec = function() {
    // 入力チェック
    let set_addr = aztool.hex_to_int($("#pim447_addr").val());
    let set_speed = parseInt($("#pim447_speed").val());
    let set_rotate = parseInt($("#pim447_rotate").val());
    let set_read_cycle = parseInt($("#pim447_read_cycle").val());
    let set_speed_type = parseInt($("#pim447_speed_type").val());
    let set_drag_flag = parseInt($("#pim447_drag_flag").val());
    if (!set_addr || set_addr < 1 || set_addr > 255) {
        $("#addpim447tb_info").html("アドレスが不正です");
        return;
    }
    if (aztool.option_add_type == 3 && (!set_speed || set_speed < 1 || set_speed > 999)) {
        $("#addpim447tb_info").html("スピードが不正です");
        return;
    }
    if (set_rotate < 0 || set_rotate > 3) {
        $("#addpim447tb_info").html("向きが不正です");
        return;
    }
    // 入力内容を配列に反映
    aztool.option_add.addr = set_addr;
    aztool.option_add.speed = set_speed;
    aztool.option_add.rotate = set_rotate;
    aztool.option_add.read_cycle = set_read_cycle;
    aztool.option_add.speed_type = set_speed_type;
    aztool.option_add.drag_flag = set_drag_flag;
    // 確認ページ表示
    aztool.addpim447tb_check_view();
};

// PIM447 から受け取ったデータを元にカーソルを動かす トラックボール
aztool.addpim447tb_check_update = function() { // 画面更新用関数
    let d_left, d_right, d_up, d_down;
    if (aztool.option_add.rotate == 1) { // 右
        d_left = aztool.opt_read_data[4];
        d_right = aztool.opt_read_data[5];
        d_up = aztool.opt_read_data[3];
        d_down = aztool.opt_read_data[2];
    } else if (aztool.option_add.rotate == 2) { // 下
        d_left = aztool.opt_read_data[3];
        d_right = aztool.opt_read_data[2];
        d_up = aztool.opt_read_data[5];
        d_down = aztool.opt_read_data[4];
    } else if (aztool.option_add.rotate == 3) { // 左
        d_left = aztool.opt_read_data[5];
        d_right = aztool.opt_read_data[4];
        d_up = aztool.opt_read_data[2];
        d_down = aztool.opt_read_data[3];
    } else { // 上
        d_left = aztool.opt_read_data[2];
        d_right = aztool.opt_read_data[3];
        d_up = aztool.opt_read_data[4];
        d_down = aztool.opt_read_data[5];
    }
    let mx = d_right - d_left;
    let my = d_down - d_up;
    let x = 200 + (mx * aztool.option_add.speed / 30);
    let y = 200 + (my * aztool.option_add.speed / 30);
    if (aztool.option_add_type == 4) {
        console.log("x = " + mx + "  y = " + my)
        x = 200; y = 200;
        if (mx < -2 && Math.abs(mx) > Math.abs(my)) {
            x = 50; y = 200;
        } else if (mx > 2 && Math.abs(mx) > Math.abs(my)) {
            x = 350; y = 200;
        } else if (my < -2 && Math.abs(mx) < Math.abs(my)) {
            x = 200; y = 50;
        } else if (my > 2 && Math.abs(mx) < Math.abs(my)) {
            x = 200; y = 350;
        }
    }
    $("#move_cursor").css({"top": y + "px", "left": x + "px"});
    if (aztool.opt_read_data[6] & 0x80) {
        $("#move_cursor").html("◆");
    } else {
        $("#move_cursor").html("◇");
    }
};

// PIM447 1U 動作チェック スクロール
aztool.addpim447tb_check_view = function() {
    let html = `
    <div style="font-size: 26px; color: black; background-color: #bde4ff; padding: 4px 20px;">PIM447 1U トラックボールの動作確認</div>
    <br>
    <center>
    <div style="width: 430px; height: 430px; border: solid 2px; #888; text-align: left;">
    <div id="move_cursor" style="color: red;position: relative; top: 200px; left: 200px; display: inline-block; font-size: 30px;">◇</div>
    </div>
    </center>
    <br><br>
    <br><br>
    <div style="text-align: right; width: 800px;">
    <a class='cancel-button' onClick='javascript:aztool.addpim447tb_setiing_view();'>戻る</a>
    　<a class="exec-button" onClick="javascript:aztool.addpim447tb_save();" style="width: 180px;">保存して再起動</a>
    </div>
    `;
    $("#pim447tb_setting_form").html(html);
    aztool.update_step_box(2);
    setTimeout(function() {
        aztool.read_check_index = 0;
        aztool.opt_read_data = [];
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_check_update_func = aztool.addpim447tb_check_update;
        aztool.option_add_read_health_check(2); // 入力取得が止まって無いか監視
        aztool.option_add_read_check_exec(2); // 入力取得開始
    }, 1000);
};

// I2C PIM447 の状態を確認する
aztool.option_add_read_check_exec_pim447 = function(step_no) {
    webhid.get_pim_key(aztool.option_add.addr, function(d) {
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_data = d;
        let t = 50;
        aztool.opt_read_check_update_func(); // 画面の情報を更新
        if (aztool.step_index != step_no) return; // 別のステップに移動したらチェックを止める
        setTimeout(function() { aztool.option_add_read_check_exec(step_no); }, t); // 次の情報を取得
    });
};

// I2C PIM447 トラックボール の設定を保存して再起動
aztool.addpim447tb_save = function() {
    // オプション配列が無ければオプション配列作成
    if (!aztool.setting_json_data.i2c_option) aztool.setting_json_data.i2c_option = [];
    // オプションにデータを追加
    let set_data = {
        "id": aztool.random_num(6), // オプションごとのユニークなID
        "type": aztool.option_add_type, // オプションのタイプ 3=PIM447(トラックボール) 4=PIM447(スクロール)
        "enable": 1, // 有効かどうか
        "addr": aztool.option_add.addr, // PIM447 のアドレス
        "rotate": aztool.option_add.rotate, // 移動する向き
        "map_start": aztool.get_map_start_next() // キー設定番号の開始位置
    };
    if (aztool.option_add.read_cycle > 0) {
        set_data["read_cycle"] = aztool.option_add.read_cycle;
    }
    if (aztool.option_add_type == 3) { // トラックボール
        set_data["speed"] = aztool.option_add.speed; // カーソルの移動速度％
        set_data["map"] = [7]; // キーと読み込んだデータとのマッピング設定(クリック)
    } else if (aztool.option_add_type == 4) { // スクロール
        set_data["map"] = [2,0,15,1,3]; // キーと読み込んだデータとのマッピング設定(スクロール＆クリック)
    } else if (aztool.option_add_type == 9) { // AZTOUCH
        set_data["speed"] = aztool.option_add.speed; // カーソルの移動速度％
        set_data["speed_type"] = aztool.option_add.speed_type; // AZTOUCHスピード
        if (aztool.option_add.drag_flag == 0) {
            set_data["drag_flag"] = aztool.option_add.drag_flag; // AZTOUCHドラッグを有効化するか
        }
        set_data["map"] = [7,6]; // キーと読み込んだデータとのマッピング設定(クリック,右クリック)
    }
    aztool.setting_json_data.i2c_option.push(set_data);
    // 設定JSON保存
    $("#pim447tb_setting_form").html("<b>保存中</b><br><div id='trackball_save_info'></div>");
    webhid.info_div = 'trackball_save_info';
    aztool.update_step_box(3);
    setTimeout(
        function() {
            aztool.setting_json_save(function(stat) {
                // 保存失敗
                if (stat != 0) {
                    aztool.addpim447tb_setiing_view();
                    $("#addpim447tb_info").html("<b>保存失敗</b>");
                    return;
                }
                $("#pim447tb_setting_form").html("<b>再起動中</b>");
                // 保存成功したらキーボードを再起動
                setTimeout(aztool.option_add_restart, 2000);
            });
        },
        2000
    );
};

// トラックボール設定モーダルオープン
aztool.addpim447tb_edit_open = function() {
    // モーダルを開く
    let h = "";
    h += "<div style='text-align: left;'>";
    h += "<h2>AZTOUCH</h2>";
    h += "<div id='addpim447tb_edit_box' style='margin: 0;'>";

    h += "<table><tr><td valign='top'>";
    // 基本設定
    h += "<table style='display: inline-block; font-size: 16px;'>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>リードサイクル：</td><td>"
    h += "<input id='tred_read_cycle' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 80px; text-align: left;'> ミリ秒";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>スピード(倍率)：</td><td>"
    h += "<input id='tred_speed' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 80px; text-align: left;'> ％";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>AZTOUCHスピード設定：</td><td>"
    h += "　<select id='tred_speed_type' style='font-size: 26px; width: 80px;'>";
    h += "<option value='0'>0</option>";
    h += "<option value='1'>1</option>";
    h += "<option value='2'>2</option>";
    h += "<option value='3'>3</option>";
    h += "<option value='4'>4</option>";
    h += "</select>";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>ドラッグ：</td><td>"
    h += "　<select id='tred_drag_flag' style='font-size: 26px; width: 80px;'>";
    h += "<option value='0'>オフ</option>";
    h += "<option value='1'>オン</option>";
    h += "</select>";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>向き：</td><td>"
    h += "　<select id='tred_rotate' style='font-size: 26px; width: 80px;'>";
    h += "<option value='0'>上</option>";
    h += "<option value='1'>右</option>";
    h += "<option value='2'>下</option>";
    h += "<option value='3'>左</option>";
    h += "</select>";
    h += "</td></tr>";
    h += "</table>";
    h += "</td><td style='width: 50px;'></td><td valign='top'>";
    h += "<table style='display: inline-block; font-size: 16px;'>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>drag_touch_time_max：</td><td>"
    h += "<input id='tred_drag_touch_time_max' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 80px; text-align: left;'> × 5 ミリ秒";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>drag_interval_time_max：</td><td>"
    h += "<input id='tred_drag_interval_time_max' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 80px; text-align: left;'> × 5 ミリ秒";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>tap_touch_time_max：</td><td>"
    h += "<input id='tred_tap_touch_time_max' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 80px; text-align: left;'> × 5 ミリ秒";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>move_touch_time_start：</td><td>"
    h += "<input id='tred_move_touch_time_start' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 80px; text-align: left;'> × 5 ミリ秒";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 18px; text-align: right;'>read_wait_time：</td><td>"
    h += "<input id='tred_read_wait_time' type='text' style='font-size: 20px; margin: 4px 20px; padding: 10px; width: 80px; text-align: left;'> × NOP";
    h += "</td></tr>";
    h += "</table>";
    h += "</td></tr></table>";

    h += "</div>";
    h += "<div id='addap_btn_box' style='margin: 20px 0 0 0;'>";
    h += "<a href='#' class='cancel-button' onClick='javascript:aztool.addpim447tb_edit_close(0);'>キャンセル</a>";
    h += "　　　　<a class='exec-button' onClick='javascript:aztool.addpim447tb_edit_close(1);'>決定</a>";
    h += "</div>";
    h += "</div>";
    aztool.remodal_open(h); // モーダルオープン
    if (!aztool.option_edit.read_cycle) {
        $("#tred_read_cycle").val('0');
    } else {
        $("#tred_read_cycle").val(aztool.option_edit.read_cycle);
    }
    $("#tred_speed").val(aztool.option_edit.speed);
    $("#tred_speed_type").val(aztool.option_edit.speed_type);
    if (!aztool.option_edit.drag_flag || aztool.option_edit.drag_flag != 0) {
        $("#tred_drag_flag").val('1');
    } else {
        $("#tred_drag_flag").val('0');
    }
    $("#tred_rotate").val(aztool.option_edit.rotate);
    console.log(aztool.option_edit);
    // aztool.param_setting_set(); // 設定をフォームに反映
    aztool.aztouch_status = [35, 2, 100, 40, 20, 20, 40]; // ステータスデフォルト
    webhid.i2c_aztouch_stat(aztool.option_edit.addr, function(stat, status_data) {
        if (stat != 0) return;
        aztool.aztouch_status = status_data;
        $("#tred_drag_touch_time_max").val(status_data[2]);
        $("#tred_drag_interval_time_max").val(status_data[3]);
        $("#tred_tap_touch_time_max").val(status_data[4]);
        $("#tred_move_touch_time_start").val(status_data[5]);
        $("#tred_read_wait_time").val(status_data[6]);
    });
};

// トラックボール設定モーダルクローズ
aztool.addpim447tb_edit_close = function(save_flag) {
    let send_arr = [];
    if (save_flag) {
        aztool.option_edit.read_cycle = parseInt($("#tred_read_cycle").val());
        aztool.option_edit.speed = parseInt($("#tred_speed").val());
        aztool.option_edit.drag_flag = parseInt($("#tred_drag_flag").val());
        aztool.option_edit.rotate = parseInt($("#tred_rotate").val());
        aztool.option_edit.speed_type = parseInt($("#tred_speed_type").val());
        if (aztool.option_edit.speed_type > 4) aztool.option_edit.speed_type = 4;
        if (aztool.option_edit.speed_type < 0) aztool.option_edit.speed_type = 0;
        if (aztool.aztouch_status[1] != aztool.option_edit.speed_type) send_arr.push([0x40, aztool.option_edit.speed_type]);
        if (aztool.option_edit.read_cycle == 0) delete aztool.option_edit.read_cycle;
        if (aztool.option_edit.drag_flag == 1) delete aztool.option_edit.drag_flag;
        let tred_drag_touch_time_max = parseInt($("#tred_drag_touch_time_max").val());
        if (tred_drag_touch_time_max > 255) tred_drag_touch_time_max = 255;
        if (tred_drag_touch_time_max < 0) tred_drag_touch_time_max = 0;
        if (aztool.aztouch_status[2] != tred_drag_touch_time_max) send_arr.push([0x41, tred_drag_touch_time_max]);
        let tred_drag_interval_time_max = parseInt($("#tred_drag_interval_time_max").val());
        if (tred_drag_interval_time_max > 255) tred_drag_interval_time_max = 255;
        if (tred_drag_interval_time_max < 0) tred_drag_interval_time_max = 0;
        if (aztool.aztouch_status[3] != tred_drag_interval_time_max) send_arr.push([0x42, tred_drag_interval_time_max]);
        let tred_tap_touch_time_max = parseInt($("#tred_tap_touch_time_max").val());
        if (tred_tap_touch_time_max > 255) tred_tap_touch_time_max = 255;
        if (tred_tap_touch_time_max < 0) tred_tap_touch_time_max = 0;
        if (aztool.aztouch_status[4] != tred_tap_touch_time_max) send_arr.push([0x43, tred_tap_touch_time_max]);
        let tred_move_touch_time_start = parseInt($("#tred_move_touch_time_start").val());
        if (tred_move_touch_time_start > 255) tred_move_touch_time_start = 255;
        if (tred_move_touch_time_start < 0) tred_move_touch_time_start = 0;
        if (aztool.aztouch_status[5] != tred_move_touch_time_start) send_arr.push([0x44, tred_move_touch_time_start]);
        let tred_read_wait_time = parseInt($("#tred_read_wait_time").val());
        if (tred_read_wait_time > 255) tred_read_wait_time = 255;
        if (tred_read_wait_time < 0) tred_read_wait_time = 0;
        if (aztool.aztouch_status[6] != tred_read_wait_time) send_arr.push([0x45, tred_read_wait_time]);
    }
    if (send_arr.length) {
        webhid.i2c_write_list(aztool.option_edit.addr, send_arr, function(stat) {
            // 設定クローズ
            aztool.setopt_opt_edit_close(save_flag);
        });
    } else {
        // 設定クローズ
        aztool.setopt_opt_edit_close(save_flag);
    }
    // モーダルクローズ
    aztool.remodal_close();
};
