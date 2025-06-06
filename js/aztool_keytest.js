// キー入力テスト


if (!window.aztool) aztool = {};

// キー入力テスト中かどうかのフラグ
aztool.keytest_flag = 0;

// キー入力テスト画面表示
aztool.view_keytest = function() {
    let h = `
    <div  style="width: 1400px;">
    <table><tr><td class="leftmenu-box">
    <!-- <a class="leftmenu-button" onClick="javascript:aztool.view_keytest_layout();">入力テスト</a><br> -->
    <a class="leftmenu-button" onClick="javascript:aztool.keytest_close();">戻る</a><br>
    </td><td valign="top" style="padding: 20px;">
    <div id='key_layout_box' style='width: 1000px; height: 400px;overflow: hidden; border: solid 1px black; text-align: left;'></div>
    <div id="setmap_info"></div>
    </td></tr></table>
    `;
    $("#main_box").html(h);
    // eztoolモード設定
    webhid.set_aztool_mode(2, function() { // eztoolモード入力テスト中
        // キーのレイアウト表示
        aztool.view_keytest_layout();
        // キー入力テスト中にする
        aztool.keytest_flag = 1;
        // キー入力取得のループ開始
        aztool.keytest_read_loop();
    });
};

// キー入力テスト終了
aztool.keytest_close = function() {
    // キー入力テスト終了
    aztool.keytest_flag = 0;
    // eztoolモード設定
    webhid.set_aztool_mode(0, function() { // eztoolモード終了
        // メインメニュー表示
        aztool.view_top_menu();
    });
};

// キーレイアウトを表示
aztool.view_keytest_layout = function() {
    let h = "";
    let kle = "";
    let i, j, l, o, m;
    let cnf = 44;
    let pos = (aztool.setting_json_data.layout && aztool.setting_json_data.layout.position)? aztool.setting_json_data.layout.position: null;
    // キー配列を表示する枠を表示
    h += "<div id='odiv_0' style='position: relative; top: 250px; display: inline-block;'></div>"; // 本体のキー配列用
    for (i in aztool.setting_json_data.i2c_option) {
        o = aztool.setting_json_data.i2c_option[i];
        if (!aztool.on_i2coption(o)) continue; // 有効でないオプションは無視
        h += "<div id='odiv_"+o.id+"' style='position: relative; display: inline-block;'></div>"; // オプションのキー配列用
    }
    $("#key_layout_box").html(h);
    // キー配列を表示
    aztool.key_layout_data = [];
    // 本体のキー配列を表示
    kle = aztool.get_main_kle(); // 本体のKLE文字列取得
    if (kle) {
        m = {
            "option": {"id": 0, "map_start": 0},
            "kle": aztool.kle_view(kle, "#odiv_0", false, cnf, "sw_0_"),
            "key_ids": []
        };
        for (i in m.kle.keys) {
            if (m.kle.keys[i].labels.length && m.kle.keys[i].labels[0]) {
                m.key_ids.push(parseInt(m.kle.keys[i].labels[0]));
            } else {
                m.key_ids.push(-1);
            }
        }
        aztool.key_layout_data.push(m);
    }
    // オプションのキー配列を表示
    for (i in aztool.setting_json_data.i2c_option) {
        o = aztool.setting_json_data.i2c_option[i];
        if (!aztool.on_i2coption(o)) continue; // 有効でないオプションは無視
        if (!aztool.i2c_option_data["o"+o.id]) continue; // KLE が無いオプションは無視
        aztool.key_layout_data.push({
            "option": aztool.setting_json_data.i2c_option[i],
            "kle": aztool.kle_view(aztool.i2c_option_data["o"+o.id], "#odiv_"+o.id, false, cnf, "sw_" + o.id + "_")
        });
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
};

// キー入力を取得するループ
aztool.keytest_read_loop = function() {
    // キー入力を取得
    webhid.read_key(function(read_data) {
        let i, j, p, r, s, oid;
        let parse_data = webhid.read_key_parce(read_data);
        // キー入力を配列にして取得
        let res = parse_data.data;
        // 入力があったキーに色を付ける
        r = 0;
        for (i in aztool.key_layout_data) {
            oid = aztool.key_layout_data[i].option.id;
            for (j in aztool.key_layout_data[i].kle.keys) {
                p = (oid == 0)? aztool.key_layout_data[i].key_ids[j]: r; // 本体ならば本体のラベルにある番号を取得、それ以外のオプションは純粋にキーの連番を取得
                s = "#sw_" + oid + "_" + j;
                if (res[p]) {
                    $(s).css({"background-color": "red"});
                } else {
                    $(s).css({"background-color": "white"});
                }
                r++;
            }
        }
        // キー入力テスト中であればまたキー入力を取得する
        if (aztool.keytest_flag > 0) {
            setTimeout(aztool.keytest_read_loop, 100);
        }
    });
};
