// カスタムレイアウト

if (!window.aztool) aztool = {};

// カスタムレイアウト
aztool.addirkb_start = function() {
    // オプション設定
    aztool.option_add_name = "IOピン";
    // HTML 作成
    aztool.addirkb_init_html();
    // データの準備
    aztool.step_max = 6;
    aztool.step_index = 0;
    aztool.option_add = {
        "id": "000000", // オプションごとのユニークなID
        "type": 7, // オプションのタイプ 7 = シリアル通信(赤外線)
        "enable": 1, // 有効かどうか 1=有効
        "kle": "[\"\"]", // KLE初期値
        "map_start": aztool.get_map_start_next(), // キー設定の番号いくつからがこのオプションのキー設定か
        "map": [] // キーと読み込んだデータとのマッピング設定
    };
    // 設定画面表示
    aztool.addirkb_layout_view();
};

// 追加設定画面表示
aztool.addirkb_init_html = function() {
    let html = `
    <div  style="width: 1200px;">
    <table><tr><td valign="top" align="center" style="width: 270px; background-color: #f8f8f8; padding: 20px 0;">
    <table>
    <tr><td align="center"><div id="stepbox_1" class="option_step">レイアウト設定</div></td></tr>
    <tr><td align="center"><div class="triangle_down"></div></td></tr>
    <tr><td align="center"><div id="stepbox_2" class="option_step">入力確認</div></td></tr>
    <tr><td align="center"><div class="triangle_down"></div></td></tr>
    <tr><td align="center"><div id="stepbox_3" class="option_step">ボタンのマッピング</div></td></tr>
    <tr><td align="center"><div class="triangle_down"></div></td></tr>
    <tr><td align="center"><div id="stepbox_4" class="option_step">動作確認</div></td></tr>
    <tr><td align="center"><div class="triangle_down"></div></td></tr>
    <tr><td align="center"><div id="stepbox_5" class="option_step">保存</div></td></tr>
    <tr><td align="center"><div class="triangle_down"></div></td></tr>
    <tr><td align="center"><div id="stepbox_6" class="option_step">完了</div></td></tr>
    </table>

    </td><td valign="top" style="padding: 20px;">
    <div id='kle_view_box' style="border: solid 1px #888; width: 800px;height: 400px;overflow: hidden; background-color: #888;"></div>
    <div id='kle_view_box_info' style="text-align: right; width: 800px;">
    <b style="font-size: 15px;">－</b>
    <input id="coef_input" type="range" name="speed" min="20" max="60" onChange="javascript:aztool.kle_view(aztool.option_add.kle, '#kle_view_box');">
    <b style="font-size: 15px;">＋</b>
    </div>
    <div id="option_setting_form">
    </div>


    </td></tr></table>

    </div>`;
    $("#" + aztool.addopt_div_id).html(html);
};

// レイアウト設定画面表示
aztool.addirkb_layout_view = function() {
    let h = `
        <br>
        <div style="font-size: 20px; color: black; background-color: #bde4ff; padding: 4px 20px;">レイアウトの設定</div>
        <br>
        <textarea id="kle_json_txt" style="width: 800px; height: 150px;"
        placeholder="KLEのレイアウトJSONを張り付けて下さい。"
        onChange="javascript:aztool.option_add_kle_change();"></textarea><br><br>
        ※ 下記のサイトでレイアウトを作成して「Raw data」のJSONをコピーして上記に張り付けて下さい。<br>
        <a href="http://www.keyboard-layout-editor.com/" target="_blank">keyboard-layout-editor.com</a><br>
        <br><br>
        <div style="text-align: right; width: 800px;">
        <div id="can_btn" style="display: inline-block"></div>
        <div id="kle_json_btn" style="display: none;">　<a class="exec-button" onClick="javascript:aztool.addirkb_check_view();">次へ</a></div>
        </div>`;
    $("#kle_view_box").show();
    $("#kle_view_box_info").show();
    $("#option_setting_form").html(h);
    $("#kle_json_txt").html(aztool.option_add.kle);
    // キャンセルするとトップメニューに戻る
    $("#can_btn").html("<a class='cancel-button' onClick='javascript:aztool.option_add_end(aztool.view_setopt);'>キャンセル</a>");
    aztool.update_step_box(1);
    aztool.option_add_kle_change();
};

// シリアル通信(赤外線)の入力値のデータを受け取る
aztool.option_add_read_check_exec_irkb = function(step_no) {
    webhid.get_serial_input(function(d) {
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_data = d;
        let t = 50;
        aztool.opt_read_check_update_func(); // 画面の情報を更新
        if (aztool.step_index != step_no) return; // 別のステップに移動したらチェックを止める
        setTimeout(function() { aztool.option_add_read_check_exec(step_no); }, t); // 次の情報を取得
    });
};

// 受け取ったキー番号を画面に表示
aztool.addirkb_check_update = function() {
    var input_list = [];
    var i;
    for (i=1; i<16; i++) {
        if (aztool.opt_read_data[i]) input_list.push(aztool.opt_read_data[i]);
    }
    if (input_list.length) {
        $("#ir_input").html(input_list.join(", "));
    } else {
        $("#ir_input").html("");
    }
};

// シリアル通信(赤外線)の入力確認
aztool.addirkb_check_view = function() {
    let html = `
    <br>
    <div style="font-size: 20px; color: black; background-color: #bde4ff; padding: 4px 20px;">赤外線入力の確認</div>
    <br>
    キースイッチを押すと、送られてきたキー番号が表示されるのを確認してください。<br>
    <div id="ir_input" style="width: 800px; height: 130px; border: solid 1px; #888; text-align: left;font-size: 26px; padding: 10px;">
    </div>
    <br><br>
    <br><br>
    <div style="text-align: right; width: 800px;">
    <a class='cancel-button' onClick='javascript:aztool.addirkb_layout_view();'>戻る</a>
    　<a class="exec-button" onClick="javascript:aztool.addirkb_map_view();" style="width: 180px;">次へ</a>
    </div>
    `;
    $("#option_setting_form").html(html);
    aztool.update_step_box(2);
    setTimeout(function() {
        // 入力テストモードに入る
        webhid.set_aztool_mode(2, function() {
            // 入力チェックを開始
            aztool.read_check_index = 0;
            aztool.opt_read_data = [];
            aztool.opt_read_lasttime = webhid.millis();
            aztool.opt_read_check_update_func = aztool.addirkb_check_update;
            aztool.option_add_read_health_check(2); // 入力取得が止まって無いか監視
            aztool.option_add_read_check_exec(2); // 入力取得開始
        });
    }, 500);
};

// マッピング画面更新
aztool.addirkb_map_update = function() {
    let i, j, f = -1;
    aztool.addirkb_check_update();
    // ボタンが押されてるキーを探す(最初の１つだけ取得)
    f = aztool.opt_read_data[1];

    // キーが押されたら次のキー
    if (f > 0 && aztool.switch_last_set != f && aztool.switch_check_index < aztool.switch_length) {
        aztool.switch_last_set = f;
        aztool.map_data.push(f); // マッピングリストにデータ追加（データ保存には使わないケド次の入力確認ステップで使用する）
        i = aztool.switch_check_index;
        aztool.serial_data.keys[i].labels = [""+f]; // kle データのラベルにキーの番号を入れる
        aztool.switch_check_index++;
        if (aztool.switch_check_index >= aztool.switch_length) {
            $("#btnmap_info").html("マッピングが完了しました。");
            $("#switch_comp_btn").css({"display": "inline-block"});
            aztool.option_add.map = aztool.map_data;
            j = JSON.stringify($serial.serialize(aztool.serial_data)); // ラベル変更後のkle json を取得
            aztool.option_add.kle = j.slice(1, -1); // slice で最初の"["と最後の"]"を削除
        }
    }
    aztool.option_add_key_color_update();
};


// キーレイアウトとキー番号のマッピング画面表示
aztool.addirkb_map_view = function() {
    let html = `
    <br>
    <div style="font-size: 20px; color: black; background-color: #bde4ff; padding: 4px 20px;">レイアウトとスイッチのマッピング</div>
    <br>
    <div id="btnmap_info">赤くなっている所のスイッチを押して下さい。</div>
    <div id="ir_input" style="width: 800px; height: 130px; border: solid 1px; #888; text-align: left;font-size: 26px; padding: 10px;">
    </div>
    <br><br>
    <br><br>
    <div style="text-align: right; width: 800px;">
    <a class='cancel-button' onClick='javascript:aztool.addirkb_check_view();'>戻る</a>
    　<a id="switch_comp_btn" class="exec-button" onClick="javascript:aztool.addirkb_test_view();" style="width: 180px; display: none;">次へ</a>
    </div>
    `;
    $("#option_setting_form").html(html);
    aztool.update_step_box(3);
    setTimeout(function() {
        // 入力テストモードに入る
        webhid.set_aztool_mode(2, function() {
            // 入力チェックを開始
            aztool.switch_check_index = 0; // 今何番目のスイッチをチェックしているか
            aztool.switch_last_set = -1; // 最後に押したスイッチの番号
            aztool.map_data = []; // マッピングしたデータ
            aztool.read_check_index = 0;
            aztool.opt_read_data = [];
            aztool.opt_read_lasttime = webhid.millis();
            aztool.opt_read_check_update_func = aztool.addirkb_map_update;
            aztool.option_add_read_health_check(3); // 入力取得が止まって無いか監視
            aztool.option_add_read_check_exec(3); // 入力取得開始
        });
    }, 500);
};

// 入力確認画面更新
aztool.addirkb_test_update = function() {
    let i, w, f = -1;
    // 押されているキー番号のリストを表示
    aztool.addirkb_check_update();
    // 押されているキーに色を付ける
    for (i=0; i<aztool.option_add.map.length; i++) {
        f = aztool.option_add.map[i];
        w = aztool.opt_read_data.includes(f);
        if (w > 0) {
            $("#sw_" + i).css({"background-color": aztool.enable_key_color}); // 押されているキーに色を付ける
        } else {
            $("#sw_" + i).css({"background-color": aztool.key_color}); // それ以外
        }
    }
};

// 入力確認画面表示
aztool.addirkb_test_view = function() {
    let html = `
    <br>
    <div style="font-size: 20px; color: black; background-color: #bde4ff; padding: 4px 20px;">動作確認</div>
    <br>
    キースイッチを押して該当するボタンが緑色になるのを確認して下さい。<br>
    <div id="ir_input" style="width: 800px; height: 130px; border: solid 1px; #888; text-align: left;font-size: 26px; padding: 10px;">
    </div>
    <br><br>
    <br><br>
    <div style="text-align: right; width: 800px;">
    <a class='cancel-button' onClick='javascript:aztool.addirkb_map_view();'>戻る</a>
    　<a id="switch_comp_btn" class="exec-button" onClick="javascript:aztool.option_addirkb_save();" style="width: 180px;">保存</a>
    </div>
    `;
    $("#option_setting_form").html(html);
    aztool.update_step_box(4);
    setTimeout(function() {
        // 入力テストモードに入る
        webhid.set_aztool_mode(2, function() {
            // 入力チェックを開始
            aztool.opt_read_data = [];
            aztool.opt_read_lasttime = webhid.millis();
            aztool.opt_read_check_update_func = aztool.addirkb_test_update;
            aztool.option_add_read_health_check(4); // 入力取得が止まって無いか監視
            aztool.option_add_read_check_exec(4); // 入力取得開始
        });
    }, 1000);
};

// 保存画面表示
aztool.option_addirkb_save = function() {
    // 保存中画面表示
    let h = `
        <div id="btncheck_info">設定内容を保存中</div>
        <div id="console_div" style="height: 120px;"></div>
        <div style="text-align: right; width: 800px;">
        <div id="switch_resave_btn" style="display: none;">　<a class="exec-button" onClick="javascript:aztool.option_addazxp_save();">保存再実行</a></div>
        </div>`;
    $("#option_setting_form").html(h);
    aztool.update_step_box(5);
    // 保存前のデータ準備
    aztool.option_add.id = aztool.random_num(6); // オプションごとのユニークなID
    // KLE データをファイルに出力
    webhid.save_file(
        "/o" + aztool.option_add.id, // 保存ファイルパス
        aztool.option_add.kle, // 保存データ
        function (stat) {
            // 保存失敗
            if (stat != 0) {
                $("#btncheck_info").html("KLEデータの保存に失敗しました");
                $("#switch_resave_btn").css({"display": "inline-block"});
                return;
            }
            // 保存成功したら配列に追加
            let set_data = {
                "id": aztool.option_add.id, // オプションごとのユニークなID
                "type": aztool.option_add.type, // オプションのタイプ
                "enable": 1, // 有効かどうか
                "map_start": aztool.get_map_start_next(), // キー設定番号の開始位置
                "map": aztool.option_add.map // キーと読み込んだデータとのマッピング設定
            };
            // オプション配列が無ければオプション配列作成
            if (!aztool.setting_json_data.i2c_option) aztool.setting_json_data.i2c_option = [];
            aztool.setting_json_data.i2c_option.push(set_data); // オプションにデータを追加
            // 設定JSON保存
            aztool.setting_json_save(function(stat) {
                // 保存失敗
                if (stat != 0) {
                    $("#btncheck_info").html("設定JSONの保存に失敗しました");
                    $("#switch_resave_btn").css({"display": "inline-block"});
                    return;
                }
                // 保存成功したらキーボードを再起動
                $("#btncheck_info").html("保存成功しました。再起動します。");
                setTimeout(function() {
                    aztool.keyboard_restart(0); // キーボードを再起動
                }, 5000);
            });
        }
    );
};
