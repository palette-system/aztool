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
        "speed": 100, // マウスの移動速度
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
    let st_th = "width: 100px;text-align: right; padding: 15px 20px;";
    let html = `
    <div style="font-size: 26px; color: black; background-color: #bde4ff; padding: 4px 20px;">PIM447 1U トラックボールの設定</div>
    <br>
    <table>
    <tr>
        <td style="`+st_th+`">アドレス</td>
        <td>0x <input type="text" id="pim447_addr" value="` + aztool.to_hex(aztool.option_add.addr, 2, "") + `" style="font-size: 26px; width: 80px;"></td>
    </tr>
    <tr id="tr_speed">
        <td style="`+st_th+`">スピード</td>
        <td><input type="text" id="pim447_speed" value="` + aztool.option_add.speed + `" style="font-size: 26px; width: 80px;"></td>
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
    if (aztool.option_add_type == 4) $("#tr_speed").css({"display": "none"});
    $("#pim447_rotate").val(aztool.option_add.rotate);
    aztool.update_step_box(1);
};

// PIM447 1U 設定 決定
aztool.addpim447tb_setiing_exec = function() {
    // 入力チェック
    let set_addr = aztool.hex_to_int($("#pim447_addr").val());
    let set_speed = parseInt($("#pim447_speed").val());
    let set_rotate = parseInt($("#pim447_rotate").val());
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
    if (aztool.option_add_type == 3) { // トラックボール
        set_data["speed"] = aztool.option_add.speed; // カーソルの移動速度
        set_data["map"] = [7]; // キーと読み込んだデータとのマッピング設定(クリック)
    } else if (aztool.option_add_type == 4) { // スクロール
        set_data["map"] = [2,0,15,1,3]; // キーと読み込んだデータとのマッピング設定(スクロール＆クリック)
    }
    aztool.setting_json_data.i2c_option.push(set_data);
    // 設定JSON保存
    $("#pim447tb_setting_form").html("保存中...");
    aztool.update_step_box(3);
    aztool.setting_json_save(function(stat) {
        // 保存失敗
        if (stat != 0) {
            aztool.addpim447tb_setiing_view();
            $("#addpim447tb_info").html("保存失敗");
            return;
        }
        $("#pim447tb_setting_form").html("再起動中...");
        // 保存成功したらキーボードを再起動
        setTimeout(aztool.option_add_restart, 2000);
    });

};
