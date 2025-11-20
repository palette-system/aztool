// トラックパッド CST816 オプション追加ツール


if (!window.aztool) aztool = {};

// CST816 の向きのタイプ
aztool.cst816_rotate_list = ["上", "右", "下", "左"];

// トラックパッド CST816 オプション追加開始
aztool.addcst816_start = function(opt_type) {
    // オプション設定
    aztool.option_add_type = opt_type;
    aztool.option_add_name = "";
    // HTML 作成
    aztool.addcst816_init_html();
    // データの準備
    aztool.step_max = 3;
    aztool.step_index = 0;
    aztool.option_add = {
        "id": "000000", // オプションごとのユニークなID
        "type": 8, // オプションのタイプ 8 = トラックパッド CST816
        "enable": 1, // 有効かどうか 1=有効
        "addr": 0x15, // CST816のアドレス(デフォルト0x15)
        "rotate": 0, // 向き 0=上 1=右 2=下 3=左
        "speed": 100, // マウスの移動速度
        "map_start": 0, // キー設定の番号いくつからがこのオプションのキー設定か
        "map": [] // キーと読み込んだデータとのマッピング設定
    };
    // 設定画面表示
    aztool.addcst816_setiing_view();
};

// PIM447 1U 追加 用HTML作成
aztool.addcst816_init_html = function() {
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
    <div id="cst816_setting_form">
    </div>

    </td></tr></table>

    </div>`;
    $("#" + aztool.addopt_div_id).html(html);
};

// トラックパッド CST816 設定
aztool.addcst816_setiing_view = function() {
    let st_th = "width: 100px;text-align: right; padding: 15px 20px;";
    let html = `
    <div style="font-size: 26px; color: black; background-color: #bde4ff; padding: 4px 20px;">トラックパッド CST816 の設定</div>
    <br>
    <table>
    <tr>
        <td style="`+st_th+`">アドレス</td>
        <td>0x <input type="text" id="cst816_addr" value="` + aztool.to_hex(aztool.option_add.addr, 2, "") + `" style="font-size: 26px; width: 80px;"></td>
    </tr>
    <tr id="tr_speed">
        <td style="`+st_th+`">スピード</td>
        <td><input type="text" id="cst816_speed" value="` + aztool.option_add.speed + `" style="font-size: 26px; width: 80px;"></td>
    </tr>
    <tr>
        <td style="`+st_th+`">向き</td>
        <td><select id="cst816_rotate" style="font-size: 26px; width: 80px;">
        <option value="0">上</option>
        <option value="1">右</option>
        <option value="2">下</option>
        <option value="3">左</option>
        </select></td>
    </tr>
    </table>
    <br><br>
    <br><br>
    <div id="addcst816_info"></div>
    <div style="text-align: right; width: 800px;">
    <a class='cancel-button' onClick='javascript:aztool.option_add_end(aztool.view_setopt);'>キャンセル</a>
    　<a class="exec-button" onClick="javascript:aztool.addcst816_setiing_exec();">次へ</a>
    </div>
    `;
    $("#cst816_setting_form").html(html);
    if (aztool.option_add_type == 4) $("#tr_speed").css({"display": "none"});
    $("#cst816_rotate").val(aztool.option_add.rotate);
    aztool.update_step_box(1);
};

// トラックパッド CST816 設定 決定
aztool.addcst816_setiing_exec = function() {
    // 入力チェック
    let set_addr = aztool.hex_to_int($("#cst816_addr").val());
    let set_speed = parseInt($("#cst816_speed").val());
    let set_rotate = parseInt($("#cst816_rotate").val());
    if (!set_addr || set_addr < 1 || set_addr > 255) {
        $("#addcst816_info").html("アドレスが不正です");
        return;
    }
    if (aztool.option_add_type == 3 && (!set_speed || set_speed < 1 || set_speed > 999)) {
        $("#addcst816_info").html("スピードが不正です");
        return;
    }
    if (set_rotate < 0 || set_rotate > 3) {
        $("#addcst816_info").html("向きが不正です");
        return;
    }
    // 入力内容を配列に反映
    aztool.option_add.addr = set_addr;
    aztool.option_add.speed = set_speed;
    aztool.option_add.rotate = set_rotate;
    // 確認ページ表示
    aztool.addcst816_check_view();
};

// PIM447 から受け取ったデータを元にカーソルを動かす トラックボール
aztool.addcst816_check_update = function() { // 画面更新用関数
    let x, y;
    if (aztool.option_add.rotate == 1) { // 右
        x = aztool.opt_read_data.x;
        y = aztool.opt_read_data.y;
    } else if (aztool.option_add.rotate == 2) { // 下
        x = aztool.opt_read_data.x;
        y = aztool.opt_read_data.y;
    } else if (aztool.option_add.rotate == 3) { // 左
        x = aztool.opt_read_data.x;
        y = aztool.opt_read_data.y;
    } else { // 上
        x = aztool.opt_read_data.x;
        y = aztool.opt_read_data.y;
    }
    $("#move_cursor").css({"top": y + "px", "left": x + "px"});
    $("#move_cursor").html("◇");
};

// PIM447 1U 動作チェック スクロール
aztool.addcst816_check_view = function() {
    let html = `
    <div style="font-size: 26px; color: black; background-color: #bde4ff; padding: 4px 20px;">トラックパッド CST816 の動作確認</div>
    <br>
    <center>
    <div style="width: 430px; height: 430px; border: solid 2px; #888; text-align: left;">
    <div id="move_cursor" style="color: red;position: relative; top: 200px; left: 200px; display: inline-block; font-size: 30px;">◇</div>
    </div>
    </center>
    <br><br>
    <br><br>
    <div style="text-align: right; width: 800px;">
    <a class='cancel-button' onClick='javascript:aztool.addcst816_setiing_view();'>戻る</a>
    　<a class="exec-button" onClick="javascript:aztool.addcst816_save();" style="width: 180px;">保存して再起動</a>
    </div>
    `;
    $("#cst816_setting_form").html(html);
    aztool.update_step_box(2);
    setTimeout(function() {
        aztool.read_check_index = 0;
        aztool.opt_read_data = [];
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_check_update_func = aztool.addcst816_check_update;
        aztool.option_add_read_health_check(2); // 入力取得が止まって無いか監視
        aztool.option_add_read_check_exec(2); // 入力取得開始
    }, 1000);
};

// I2C PIM447 の状態を確認する
aztool.option_add_read_check_exec_cst816 = function(step_no) {
    webhid.get_cst816(aztool.option_add.addr, function(d) {
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_data = d;
        let t = 50;
        aztool.opt_read_check_update_func(); // 画面の情報を更新
        if (aztool.step_index != step_no) return; // 別のステップに移動したらチェックを止める
        setTimeout(function() { aztool.option_add_read_check_exec(step_no); }, t); // 次の情報を取得
    });
};

// トラックパッド CST816 の設定を保存して再起動
aztool.addcst816_save = function() {
    // オプション配列が無ければオプション配列作成
    if (!aztool.setting_json_data.i2c_option) aztool.setting_json_data.i2c_option = [];
    // オプションにデータを追加
    let set_data = {
        "id": aztool.random_num(6), // オプションごとのユニークなID
        "type": aztool.option_add_type, // オプションのタイプ 8=トラックパッド CST816
        "enable": 1, // 有効かどうか
        "addr": aztool.option_add.addr, // CST816 のアドレス
        "rotate": aztool.option_add.rotate, // 移動する向き
        "map_start": aztool.get_map_start_next() // キー設定番号の開始位置
    };
    set_data["speed"] = aztool.option_add.speed; // カーソルの移動速度
    set_data["map"] = [7]; // キーと読み込んだデータとのマッピング設定(クリック)
    aztool.setting_json_data.i2c_option.push(set_data);
    // 設定JSON保存
    $("#cst816_setting_form").html("保存中...");
    aztool.update_step_box(3);
    aztool.setting_json_save(function(stat) {
        // 保存失敗
        if (stat != 0) {
            aztool.addcst816_setiing_view();
            $("#cst816_setting_form").html("保存失敗");
            return;
        }
        $("#cst816_setting_form").html("再起動中...");
        // 保存成功したらキーボードを再起動
        setTimeout(aztool.option_add_restart, 2000);
    });

};
