// アクチュエーションポイント設定

if (!window.aztool) aztool = {};

// 現在設定中のキー
aztool.actuation_select_key = 0;

// 設定をフォームへ反映したかどうか
aztool.actp_form_set_flag = 0;


// アクチュエーションポイント設定開始
aztool.actuation_setting = function() {
    // キーボードの動作を入力スキャンだけにする
    webhid.set_aztool_mode(2, function() {
        let h = "";
        h += "<div id='actu_info'></div>";
        h += "<br>";
        h += "アクチュエーションタイプ：　";
        h += "<select id='actp_select' onChange='javascript:aztool.actp_select_change();'>";
        h += "<option value='0'>固定アクチュエーションポイント</option>";
        h += "<option value='1'>動的アクチュエーションポイント</option>";
        h += "<option value='2'>二段入力</option>";
        h += "</select><br>";
        h += "アクチュエーションポイント：　<input id='actu_txt' type='text' style='font-size: 20px; width: 120px;'><br>";
        h += "ラピットトリガー：　<input id='rapd_txt' type='text' style='font-size: 20px; width: 120px;'><br>";
        h += "<input type='button' value='変更' onClick='javascript:aztool.actuation_set();'>";
        h += "<br><br>";
        h += "<input type='button' value='終了' onClick='javascript:aztool.actuation_setting_end();'>";
        $("#key_set_list").html(h);
        aztool.setmap_stat = 4;
        // 最初のキーを選択
        let div_id = aztool.get_first_div_id();
        let key_id = aztool.get_key_id(div_id);
        aztool.actuation_key_select(div_id, key_id);
        // アナログキー読み込みループ開始
        aztool.actp_form_set_flag = 0;
        aztool.actuation_read_loop();
    });

};

// アクチュエーションポイントのタイプ変更
aztool.actp_select_change = function() {
    let actps = parseInt($("#actp_select").val());
    if (actps == 0) {
        $("#actu_txt").val("150");
        $("#rapd_txt").val("100");
    } else if (actps == 1) {
        $("#actu_txt").val("60");
        $("#rapd_txt").val("60");
    } else if (actps == 2) {
        $("#actu_txt").val("40");
        $("#rapd_txt").val("180");
    }
    let actpt = parseInt($("#actu_txt").val());
    let rapid = parseInt($("#rapd_txt").val());
    webhid.set_analog_switch(aztool.actuation_select_key, actps, actpt, rapid, function() {

    });

};

// アクチュエーションポイント設定終了
aztool.actuation_setting_end = function() {
    $("#key_set_list").html(""); // キーマップ下の領域を空にする
    aztool.setmap_stat = 0; // アクチュエーションポイント設定中フラグを戻す
    aztool.actuation_key_color_set(""); // ボタンの選択色をクリア
    webhid.set_aztool_mode(0, function() {
        aztool.key_set_list_init(); // キーマップ下の領域にキーボタンを表示
    });
};


// 選択中のキーを変更
aztool.actuation_key_select = function(div_id, key_id) {
    aztool.actuation_select_key = parseInt(key_id.split("_")[1]);
    aztool.actuation_key_color_set(div_id);
    aztool.actp_form_set_flag = 0;
};


// 選択キーだけ色を付ける
aztool.actuation_key_color_set = function(div_id) {
    let i, j, o, p, s;
    for (i in aztool.key_layout_data) {
        s = aztool.key_layout_data[i].kle;
        o = aztool.key_layout_data[i].option;
        for (j in s.keys) {
            p = "sw_"+o.id+"_"+j;
            if (p == div_id) {
                $("#sw_"+o.id+"_"+j).css({"background-color": aztool.enable_key_color}); // 選択したキー
            } else {
                $("#sw_"+o.id+"_"+j).css({"background-color": aztool.key_color}); // それ以外
            }
        }
    }
};


// 最初のキーのdiv_idを取得
aztool.get_first_div_id = function() {
    let i, j, o, s;
    for (i in aztool.key_layout_data) {
        s = aztool.key_layout_data[i].kle;
        o = aztool.key_layout_data[i].option;
        for (j in s.keys) {
            return "sw_"+o.id+"_"+j;
        }
    }
};


// アナログキーの入力状態取得
aztool.actuation_read_loop = function() {
    // キーボードからアナログ情報取得
    webhid.get_analog_switch(aztool.actuation_select_key, function(d) {
        let h = "";
        let i, c, p;
        if (aztool.actp_form_set_flag == 0) {
            aztool.actp_form_set_flag = 1;
        } else if (aztool.actp_form_set_flag == 1) {
            $("#actp_select").val(d[3] + "");
            $("#actu_txt").val(d[4] + "");
            $("#rapd_txt").val(d[5] + "");
            aztool.actp_form_set_flag = 2;
        }
        h += "キーNO : " + aztool.actuation_select_key + "<br>";
        h += "アクチュエーションタイプ : " + d[3] + "<br>";
        h += "アクチュエーションポイント : " + d[4] + "<br>";
        h += "ラピットトリガー : " + d[5] + "<br>";
        h += "オフセット : " + ((d[6] << 8) + d[7])+ "<br>";
        h += "アナログ値 : " + d[8] + "<br>";
        h += "最も押し込んだ時 : " + d[9] + "<br>";
        h += "ステータス : " + d[10] + "<br>";
        h += "押し込み：";
        if (d[3] == 2) {
            c = "#888";
            if (d[10] == 2) c = "#66F";
            if (d[10] == 3) c = "#3C3";
        } else {
            c = (d[10] == 1)? "#3C3": "#888";
        }
        for (i=0; i<255; i+=10) {
            p = (i < d[8])? "■": "□";
            if (d[3] == 0 && d[4] > (i - 10) && d[4] <= i) {
                // 固定アクチュエーションポイント
                h += "<font style='color: #F99'>■</font>";
            } else if (d[3] == 0 && d[5] > (i - 10) && d[5] <= i) {
                // 固定ラピットトリガー
                h += "<font style='color: #F99'>■</font>";

            } else if (d[3] == 1 && (d[9] + d[4]) > (i - 10) && (d[9] + d[4]) <= i) {
                // 動的アクチュエーションポイント
                h += "<font style='color: #F99'>■</font>";
            } else if (d[3] == 1 && (d[9] - d[5]) > (i - 10) && (d[9] - d[5]) <= i) {
                // 動的ラピットトリガー
                h += "<font style='color: #F99'>■</font>";
            } else if (d[3] == 1 && d[9] > (i - 10) && d[9] <= i) {
                // 動的基準位置
                h += "<font style='color: #99F'>■</font>";

            } else if (d[3] == 2 && 40 > (i - 10) && 40 <= i) {
                // 1段目開始位置
                h += "<font style='color: #F99'>■</font>";
            } else if (d[3] == 2 && 180 > (i - 10) && 180 <= i) {
                // 1段目開始位置
                h += "<font style='color: #F99'>■</font>";

            } else if (i < d[8]) {
                h += "<font style='color: "+c+"'>■</font>";
            } else {
                h += "<font style='color: #AAA'>□</font>";
            }
        }
        $("#actu_info").html(h);
        if (aztool.setmap_stat == 4) {
            setTimeout(aztool.actuation_read_loop, 20);
        }
    });
};


// アクチュエーションポイント変更
aztool.actuation_set = function() {
    let actps = parseInt($("#actp_select").val());
    let actpt = parseInt($("#actu_txt").val());
    let rapid = parseInt($("#rapd_txt").val());
    let lid = aztool.setmap_select_layer; // 選択中のレイヤーのキー名
    let kid = "key_" + aztool.actuation_select_key;
    let press = aztool.setting_json_data.layers[lid].keys[kid].press;
    press.act = actps;
    press.acp = actpt;
    press.rap = rapid;
    webhid.set_analog_switch(aztool.actuation_select_key, actps, actpt, rapid, function() {

    });
};
