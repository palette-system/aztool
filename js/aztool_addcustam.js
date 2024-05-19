// カスタムレイアウト

if (!window.aztool) aztool = {};

// カスタムレイアウト
aztool.addcustam_start = function() {
    // オプション設定
    aztool.option_add_name = "IOピン";
    // HTML 作成
    aztool.addopt_init_html();
    // データの準備
    aztool.step_max = 6;
    aztool.step_index = 0;
    aztool.option_add = {
        "kle": aztool.get_main_kle(), // 現在の本体KLE
        "keyboard_pin": aztool.clone(aztool.setting_json_data.keyboard_pin), // 現在の本体のピン設定
        "i2c_set": aztool.clone(aztool.setting_json_data.i2c_set), // 現在の本体のピン設定
        "map": [] // キーと読み込んだデータとのマッピング設定
    };
    if (!aztool.option_add.keyboard_pin.direct) aztool.option_add.keyboard_pin.direct = [];
    if (!aztool.option_add.keyboard_pin.touch) aztool.option_add.keyboard_pin.touch = [];
    if (!aztool.option_add.keyboard_pin.col) aztool.option_add.keyboard_pin.col = [];
    if (!aztool.option_add.keyboard_pin.row) aztool.option_add.keyboard_pin.row = [];
    // 設定画面表示
    aztool.addcustam_layout_view();
};

// レイアウト設定画面表示
aztool.addcustam_layout_view = function() {
    let h = `
        <br>    
        <textarea id="kle_json_txt" style="width: 800px; height: 150px;"
        placeholder="KLEのレイアウトJSONを張り付けて下さい。"
        onChange="javascript:aztool.option_add_kle_change();"></textarea><br>
        <a href="http://www.keyboard-layout-editor.com/" target="_blank">keyboard-layout-editor.com</a><br>
        <br><br>
        <div style="text-align: right; width: 800px;">
        <div id="can_btn" style="display: inline-block"></div>
        <div id="kle_json_btn" style="display: none;">　<a class="exec-button" onClick="javascript:aztool.addcustam_ioset_view();">次へ</a></div>
        </div>`;
    $("#kle_view_box").show();
    $("#kle_view_box_info").show();
    $("#option_setting_form").html(h);
    $("#kle_json_txt").html(aztool.option_add.kle);
    // キャンセルするとトップメニューに戻る
    $("#can_btn").html("<a class='cancel-button' onClick='javascript:aztool.option_add_end(aztool.view_top_menu);'>キャンセル</a>");
    aztool.update_step_box(1);
    aztool.option_add_kle_change();
};

// エキスパンダ設定画面表示
aztool.addcustam_ioset_view = function() {
    let st_th = "width: 150px;text-align: right; padding: 15px 20px;";
    let h = `
        <div style="color: #000; font-size: 18px;font-weight: bold;">■ IOピンの設定</div>
        <br><br>
        <table>
        <tr>
            <td style="`+st_th+`">ダイレクトピン</td>
            <td><input type="text" id="pin_direct" value="" style="font-size: 26px; width: 500px;"></td>
        </tr>
        <tr>
            <td style="`+st_th+`">タッチピン</td>
            <td><input type="text" id="pin_touch" value="" style="font-size: 26px; width: 500px;"></td>
        </tr>
        <tr>
            <td style="`+st_th+`">colピン</td>
            <td><input type="text" id="pin_col" value="" style="font-size: 26px; width: 500px;"></td>
        </tr>
        <tr>
            <td style="`+st_th+`">rowピン</td>
            <td><input type="text" id="pin_row" value="" style="font-size: 26px; width: 500px;"></td>
        </tr>
        <tr>
            <td style="`+st_th+`">I2Cピン</td>
            <td>
            SDA <input type="text" id="pin_sda" value="" style="font-size: 26px; width: 80px;">　　
            SCL <input type="text" id="pin_scl" value="" style="font-size: 26px; width: 80px;">
            </td>
        </tr>
        </table>
        <br><br>
        <div id="pin_error" style="color: #ff5656; font-size: 15px;"></div>
        <br><br>
        <div style="color: #888; font-size: 14px;">
        ※ ピン番号をカンマ区切りで入力して下さい。<br>
        ※ EN、SD0、SD1、SD2、SD3、CMD、CLK はIOピンとして使用できません。<br>
        ※ 0、1(TX)、3(RX) はIOピンですがファームウェア書込み時に使用するので非推薦です。<br>
        ※ 34、35、36(VP)、39(VN)は入力専用のためダイレクトピン、rowピンでのみ使用できます。<br>　　(内部プルアップが無いので使用時はプルアップして下さい)<br>
        ※ タッチは 0、2、4、12、13、4、15、27、32、33 のみ指定できます。<br>
        ※ ESP32-WROVER で 16、17 は使用できないので注意です。<br>
        </div>
        <br><br>
        <div style="text-align: right; width: 800px;">
        <a class="cancel-button" onClick="javascript:aztool.addcustam_layout_view();">戻る</a>　
        <a class="exec-button" onClick="javascript:aztool.addcustam_ioset_set();">次へ</a>
        </div>`;
    $("#option_setting_form").html(h);
    let d = aztool.option_add.keyboard_pin;
    $("#pin_direct").val(d.direct.join(", "));
    $("#pin_touch").val(d.touch.join(", "));
    $("#pin_col").val(d.col.join(", "));
    $("#pin_row").val(d.row.join(", "));
    $("#pin_sda").val(aztool.option_add.i2c_set[0]);
    $("#pin_scl").val(aztool.option_add.i2c_set[1]);
    $("#kle_view_box").hide();
    $("#kle_view_box_info").hide();
    aztool.update_step_box(2);
};

// 入力されたピン内容をチェック
aztool.addcustam_ioset_check = function(check_data) {
    // 同じピンが複数個所で使用されていないかチェック
    let ks = ["direct", "touch", "col", "row"];
    let ts = [0, 2, 4, 12, 13, 14, 15, 27, 32, 33]; // タッチで使用できるピン
    // ノーマルESP32 のみ 用 let as = [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 39]; // 使用できるピン全て
    let as = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 39, 40, 41, 42, 43, 44, 46]; // 使用できるピン全て(S3も含む)
    let rs = [34, 35, 36, 39]; // 読み込み専用ピン
    let c, i, j, x;
    // 指定したすべての番号の配列を作成
    c = [];
    for (i in ks) {
        c = c.concat(check_data.keyboard_pin[ks[i]]);
    }
    c.push(check_data.i2c_set[0]);
    c.push(check_data.i2c_set[1]);
    // 入力されたピンを全てチェック
    for (i in c) {
        x = c[i];
        // マイナス指定のピンは無視
        if (x < 0) continue;
        // 同じ番号が使われていないかチェック
        if (c.indexOf(x) != i) {
            return "ピン "+x+" が複数個所で指定されています";
        }
        // 使用できないピンが入っていないかチェック
        if (as.indexOf(x) < 0) {
            return "ピン "+x+" は使用できません";
        }
    }
    // タッチピンチェック
    for (i in check_data.keyboard_pin.touch) {
        x = check_data.keyboard_pin.touch[i];
        if (ts.indexOf(x) < 0) {
            return "ピン " + x + " はタッチピンに指定できません";
        }
    }
    // 入力専用ピンが row 以外に使用されていないかチェック
    for (i in ks) {
        if (ks[i] == "direct" || ks[i] == "row") continue; // direct, row は無視
        x = check_data.keyboard_pin[ks[i]];
        for (j in x) {
            if (rs.indexOf(x[j]) >= 0) {
                return "ピン " + x[j] + " はダイレクトピンかROWピンでのみ使用できます";
            }
        }
    }
    // col か row かどちらかしか入力してない
    if (check_data.keyboard_pin.row.length && !check_data.keyboard_pin.col.length) return "col ピンが指定されていません";
    if (!check_data.keyboard_pin.row.length && check_data.keyboard_pin.col.length) return "row ピンが指定されていません";
    // 全てのチェック完了したらエラーなし
    return "";
};

// 入力されたIOをチェックして変数へ格納
aztool.addcustam_ioset_set = function() {
    let c, i, j, m, n, s, v, x;
    let check_data = {"keyboard_pin": {"direct":[], "touch":[], "col":[], "row":[]}, "i2c_set": [-1, -1, -1]};
    let ks = ["direct", "touch", "col", "row"];
    // 入力データを配列にして取得
    for (i in ks) {
        n = $("#pin_" + ks[i]).val();
        if (!aztool.is_pin_num(n)) { // 半角数字とカンマ以外の文字が入って無いかチェック
            $("#pin_error").html("半角数字をカンマ区切りで入力して下さい [ " + ks[i] + " ]");
            return;
        }
        s = n.split(",");
        v = [];
        for (j in s) {
            c = s[j].trim();
            if (!c.length) continue;
            m = parseInt(c);
            v.push(m);
        }
        check_data.keyboard_pin[ks[i]] = aztool.array_uniq(v); // 重複分を削除して保持
    }
    x = $("#pin_sda").val();
    check_data.i2c_set[0] = (x.length)? parseInt(x): -1;
    x = $("#pin_scl").val();
    check_data.i2c_set[1] = (x.length)? parseInt(x): -1;
    console.log(check_data);
    // 入力チェック
    c = aztool.addcustam_ioset_check(check_data);
    if (c.length) {
        $("#pin_error").html(c);
        return;
    }
    // 編集中の変数へ入力内容を格納
    aztool.option_add.keyboard_pin = check_data.keyboard_pin;
    aztool.option_add.i2c_set[0] = check_data.i2c_set[0];
    aztool.option_add.i2c_set[1] = check_data.i2c_set[1];
    // チェックOKなら入力確認を開始する
    aztool.addcustam_start_check_mode();
};

// 入力テスト用にキーボードのピン設定を変更して入力テストモードにする
aztool.addcustam_start_check_mode = function() {
    // 入力ピンの設定を変更
    webhid.set_pin_set(aztool.option_add.keyboard_pin, function(stat, res) {
        if (stat == 0) {
            // キーボード本体を入力テストモードに変更
            setTimeout(function () {
                webhid.set_aztool_mode(2, function() {
                    // 入力確認画面表示
                    aztool.addcustam_iocheck_view();
                });
            }, 300);
        } else {
            $("#pin_error").html("キーボードのピン設定を変更できませんでした");
            return;
        }
    });
};

// 入力確認画面表示
aztool.addcustam_iocheck_view = function() {
    let h = `
        キースイッチを押すとDataが緑色になる事を確認して下さい。<br>
        <div id="read_check_info" style="height: 120px;"></div>
        <div style="text-align: right; width: 800px;">
        <a class="cancel-button" onClick="javascript:aztool.addcustam_ioset_set_back();">戻る</a>
        　<a class="exec-button" onClick="javascript:aztool.addcustam_keymap_view();">次へ</a>
        </div>`;
    $("#option_setting_form").html(h);
    $("#kle_view_box").show();
    $("#kle_view_box_info").show();
    aztool.update_step_box(3);
    setTimeout(function() {
        aztool.read_check_index = 0;
        aztool.opt_read_data = [];
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_check_update_func = aztool.option_add_iopin_check_update; // 画面更新用関数
        aztool.option_add_read_health_check(3); // 入力取得が止まって無いか監視
        aztool.option_add_read_check_exec(3); // 入力取得開始
    }, 300);

};

// IOピンの入力状態を確認する
aztool.option_add_read_check_exec_iopin = function(step_no) {
    webhid.read_key(function(read_data) {
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_data = webhid.read_key_parce(read_data);
        let t = 50;
        aztool.opt_read_check_update_func(); // 画面の情報を更新
        if (aztool.step_index != step_no) return; // 別のステップに移動したらチェックを止める
        setTimeout(function() { aztool.option_add_read_check_exec(step_no); }, t); // 次の情報を取得
    });
};

// 取得したIOピン入力状態を画面に反映する
aztool.option_add_iopin_check_update = function () {
    let d, i;
    let h = "";
    h += "<table>";
    h += "<tr><td>Data: </td><td>";
    for (i in aztool.opt_read_data.data) {
        d = aztool.opt_read_data.data[i]; // 受け取った情報
        h += (aztool.opt_read_data.data[i])? "<div class='check_on'></div>": "<div class='check_off'></div>";
        if ((i % 16) == 15) h += "<br>";
    }
    h += "</td></tr>";
    h += "</table>";
    $("#read_check_info").html(h);
};

// IO入力チェックから IOピン設定ページに戻る (キーボード本体の入力テストモードを終了する必要がある)
aztool.addcustam_ioset_set_back = function() {
    // キーボードを入力無しのモードに変更
    webhid.set_aztool_mode(1, function() {
        // ピン設定画面を表示
        aztool.addcustam_ioset_view();
    });
};

// キーマッピング画面表示
aztool.addcustam_keymap_view = function() {
    let h = `
        <div id="btnmap_info">赤色になったキースイッチを押して下さい。</div>
        <div id="read_check_info" style="height: 120px;"></div>
        <div style="text-align: right; width: 800px;">
        <a class="cancel-button" onClick="javascript:aztool.addcustam_iocheck_view();">戻る</a>
        <div id="switch_comp_btn" style="display: none;">　<a class="exec-button" onClick="javascript:aztool.option_addcustam_btncheck_view();">次へ</a></div>
        </div>`;
    $("#option_setting_form").html(h);
    aztool.update_step_box(4);
    setTimeout(function(){
        aztool.switch_check_index = 0; // 今何番目のスイッチをチェックしているか
        aztool.switch_last_set = -1; // 最後に押したスイッチの番号
        aztool.read_check_index = 0;
        aztool.opt_read_data = [];
        aztool.map_data = []; // マッピングしたデータ
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_check_update_func = aztool.option_addcustam_keymap_update_func; // 画面更新用関数
        aztool.option_add_read_health_check(4); // 入力取得が止まって無いか監視
        aztool.option_add_read_check_exec(4); // 入力取得開始
    }, 700);
};

// キーの入力状態を取得
aztool.option_addcustam_keymap_update_func = function() {
    let dat = aztool.opt_read_data.data; // キーのステータス表示をする
    let i, j, f = -1;
    aztool.option_add_iopin_check_update();
    // ボタンが押されてるキーを探す(最初の１つだけ取得)
    for (i in dat) {
        if (dat[i]) {
            f = i;
            break;
        }
    }

    // キーが押されたら次のキー
    if (f >= 0 && aztool.switch_last_set != f && aztool.switch_check_index < aztool.switch_length) {
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

// ボタンの入力チェック
aztool.option_addcustam_btncheck_view = function() {
    let h = `
        <div id="btncheck_info">キースイッチを押して該当のスイッチの色が変わるのを確認して下さい。</div>
        <div id="read_check_info" style="height: 120px;"></div>
        <div style="text-align: right; width: 800px;">
        <a class="cancel-button" onClick="javascript:aztool.addcustam_keymap_view();">戻る</a>
        　<a class="exec-button" onClick="javascript:aztool.option_addcustam_save();">次へ</a>
        </div>`;
    $("#option_setting_form").html(h);
    aztool.update_step_box(5);
    setTimeout(function(){
        aztool.read_check_index = 0;
        aztool.opt_read_data = [];
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_check_update_func = aztool.option_addcustam_map_check_update; // 画面更新用関数
        aztool.option_add_read_health_check(5); // 入力取得が止まって無いか監視
        aztool.option_add_read_check_exec(5); // 入力取得開始
    }, 700);
};

// マッピングの入力チェック
aztool.option_addcustam_map_check_update = function() {
    aztool.option_add_iopin_check_update(); // キーのステータス表示をする
    let dat = aztool.opt_read_data.data; // キーの入力データ
    let i, x;
    for (i in aztool.option_add.map) {
        x = aztool.option_add.map[i];
        if (dat[x]) {
            $("#sw_" + i).css({"background-color": aztool.enable_key_color}); // 押しているキー
        } else {
            $("#sw_" + i).css({"background-color": aztool.key_color}); // 押していないキー
        }
    }
};

// 設定内容を保存
aztool.option_addcustam_save = function() {
    // 保存中画面表示
    let h = `
        <div id="btncheck_info">設定内容を保存中</div>
        <div id="console_div" style="height: 120px;"></div>
        <div style="text-align: right; width: 800px;">
        </div>`;
    $("#option_setting_form").html(h);
    aztool.update_step_box(6);
    // KLE データをファイルに出力
    webhid.save_file(
        aztool.kle_json_path, // 保存するKLE JSON のパス
        aztool.option_add.kle, // 保存データ
        function (stat) {
            // 保存失敗
            if (stat != 0) {
                $("#console_div").html("kleデータの保存に失敗しました");
                return;
            }
            // 保存が成功したらピンデータなども変更して設定JSONを保存
            aztool.setting_json_data.keyboard_pin = aztool.clone(aztool.option_add.keyboard_pin);
            aztool.setting_json_data.i2c_set[0] = aztool.clone(aztool.option_add.i2c_set[0]);
            aztool.setting_json_data.i2c_set[1] = aztool.clone(aztool.option_add.i2c_set[1]);
            // 設定JSON保存
            aztool.setting_json_save(function(stat) {
                // 保存失敗
                if (stat != 0) {
                    $("#console_div").html("設定JSONの保存に失敗しました");
                    return;
                }
                // 保存成功したら再起動(一応画面が確認できるよう2秒くらい待ってから)
                $("#console_div").html("保存完了しました。");
                setTimeout(function() {
                    aztool.keyboard_restart(0); // キーボードを再起動
                }, 5000);
            });
        }
    );
};

