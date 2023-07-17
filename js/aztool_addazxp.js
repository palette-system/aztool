// AZエキスパンダ追加

if (!window.aztool) aztool = {};

aztool.azxp_pin_set_list = ["未使用", "ダイレクト", "COL", "ROW", "ロータリーA", "ロータリーB", "ロータリーC", "ロータリーD", "ロータリーE", "ロータリーF", "ロータリーG", "ロータリーH"];

// AZエキスパンダから設定を読み出す
aztool.read_azxp_setting = function(addr, cb_func) {
    if (!cb_func) cb_func = function() {};
    // 設定読み込みコマンド送信
    webhid.i2c_write(addr, [0x02], function(stat) {
        // コマンド送信失敗
        if (stat != 0) {
            cb_func(1, []);
            return;
        }
        // コンフィグを取得(18バイト読み込み)
        webhid.i2c_read(addr, 18, function(len, res) {
            // 読み込んだデータがおかしければエラー
            if (len != 18 || res.length != 18 || res[0] != addr) {
                cb_func(2, []);
                return;
            }
            // 読み込んだコンフィグデータを返す
            cb_func(0, res);
        });
    });
};

// AZエキスパンダに設定を書き込む
aztool.write_azxp_setting = function(addr, write_setting, cb_func) {
    if (!cb_func) cb_func = function() {};
    // 設定書込みコマンド送信
    let cmd = aztool.clone(write_setting);
    cmd.unshift(0x01); // 先頭に書込みコマンド追加
    webhid.i2c_write(addr, cmd, function(stat) {
        // コマンド送信失敗
        if (stat != 0) {
            cb_func(1);
            return;
        }
        // 書込み結果取得(結果は2バイト)
        webhid.i2c_read(addr, 2, function(len, res) {
            // アドレスが変わった場合レスポンス無しの場合もあるからとりあえず何でも成功
            cb_func(0);
        });
    });
};

// AZエキスパンダのキー数、データのバイト数を取得する
aztool.read_azxp_key_info = function(addr, cb_func) {
    if (!cb_func) cb_func = function() {};
    // キーインフォ取得コマンド送信
    webhid.i2c_write(addr, [0x03], function(stat) {
        // コマンド送信失敗
        if (stat != 0) {
            cb_func(1, {"len": 0, "byte": 0});
            return;
        }
        // 書込み結果取得(結果は2バイト)
        webhid.i2c_read(addr, 2, function(len, res) {
            // 結果が2バイト以外はエラー
            if (len != 2) {
                cb_func(1, {"len": 0, "byte": 0});
                return;
            }
            // 成功
            cb_func(0, {"len": res[0], "byte": res[1]});
        });
    });
};

// AZエキスパンダのキー入力を取得する
aztool.read_azxp_key = function(addr, read_byte, cb_func) {
    if (!cb_func) cb_func = function() {};
    // 読み込みコマンド送信
    webhid.i2c_write(addr, [0x04], function(stat) {
        // コマンド送信失敗
        if (stat != 0) {
            cb_func(1, []);
            return;
        }
        // 書込み結果取得(結果は2バイト)
        webhid.i2c_read(addr, read_byte, function(len, res, raw_data) {
            // 読み込みバイト数が少ない場合はエラー
            if (len < read_byte) {
                cb_func(2, res);
                return;
            }
            // 読み込み成功
            cb_func(0, res);
        });
    });
};

// カスタムレイアウト
aztool.addazxp_start = function() {
    // オプション設定
    aztool.option_add_name = "AZエキスパンダ";
    // HTML 作成
    aztool.addopt_init_html();
    // データの準備
    aztool.step_max = 6;
    aztool.step_index = 0;
    aztool.option_add = {
        "id": "000000", // オプションごとのユニークなID
        "type": aztool.option_add_type, // オプションのタイプ 1=IOエキスパンダ / 2=I2Cロータリーエンコーダ
        "enable": 1, // 有効かどうか 1=有効
        "kle": "", // KLEのJSONデータ
        "azxp": [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], // AZエキスパンダの設定
        "azxp_info": {}, // キーの数やバイト数
        "map_start": 0, // キー設定の番号いくつからがこのオプションのキー設定か
        "map": [] // キーと読み込んだデータとのマッピング設定
    };
    // 設定画面表示
    aztool.addazxp_layout_view();
};

// レイアウト設定画面表示
aztool.addazxp_layout_view = function() {
    let h = `
        <br>    
        <textarea id="kle_json_txt" style="width: 800px; height: 150px;"
        placeholder="KLEのレイアウトJSONを張り付けて下さい。"
        onChange="javascript:aztool.option_add_kle_change();"></textarea>
        <br><br>
        <div style="text-align: right; width: 800px;">
        <div id="can_btn" style="display: inline-block"></div>
        <div id="kle_json_btn" style="display: none;">　<a class="exec-button" onClick="javascript:aztool.addazxp_ioset_view();">次へ</a></div>
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
aztool.addazxp_ioset_view = function() {
    let st_th = "width: 120px;text-align: right; padding: 15px 20px;";
    let st_sl = "font-size: 26px; width: 200px; text-align: center;";
    let h = `
        <div style="color: #000; font-size: 18px;font-weight: bold;">■ AZエキスパンダの設定</div>
        <br><br>
        <table>
        <tr>
        <td style="width: 300px;text-align: right; padding: 15px 20px;">AZエキスパンダのアドレス</td>
        <td>
            <div id="azxp_addr" style='display: inline-block; font-size: 24px; font-weight: bold;'>未選択</div>
            　<a class="exec-button" onClick="javascript:aztool.addazxp_stpaddr_open();" style="width: 100px;">変更</a>
        </td>
        </tr>
        <tr>
        <td style="width: 300px;text-align: right; padding: 15px 20px;">マトリックススキャンのタイプ</td>
        <td>
            <select id="azxp_scan_type" style="font-size: 22px; width: 300px; text-align: center;">
            <option value="0">通常マトリックス</option>
            <option value="1">倍マトリックス</option>
            </select>
        </td>
        </tr>
        </table>
        <br>
        <table><tr><td>
        <table>
        <tr><td style="`+st_th+`">ピン0</td><td><select id="azxp_pin_0" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン1</td><td><select id="azxp_pin_1" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン2</td><td><select id="azxp_pin_2" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン3</td><td><select id="azxp_pin_3" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン4</td><td><select id="azxp_pin_4" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン5</td><td><select id="azxp_pin_5" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン6</td><td><select id="azxp_pin_6" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン7</td><td><select id="azxp_pin_7" style="` + st_sl + `"></select></td></tr>
        </table>
        </td><td>
        <table>
        <tr><td style="`+st_th+`">ピン15</td><td><select id="azxp_pin_15" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン14</td><td><select id="azxp_pin_14" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン13</td><td><select id="azxp_pin_13" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン12</td><td><select id="azxp_pin_12" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン11</td><td><select id="azxp_pin_11" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン10</td><td><select id="azxp_pin_10" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン9</td><td><select id="azxp_pin_9" style="` + st_sl + `"></select></td></tr>
        <tr><td style="`+st_th+`">ピン8</td><td><select id="azxp_pin_8" style="` + st_sl + `"></select></td></tr>
        </table>
        </td></tr></table>
        <br><br>
        <div id="pin_error" style="color: #ff5656; font-size: 15px;"></div>
        <br><br>
        <div id="azxp_ioset_btn" style="text-align: right; width: 800px;">
        <a class="cancel-button" onClick="javascript:aztool.addazxp_layout_view();">戻る</a>　
        <a class="exec-button" onClick="javascript:aztool.addazxp_ioset_set();">次へ</a>
        </div>`;
    $("#option_setting_form").html(h);
    $("#kle_view_box").hide();
    $("#kle_view_box_info").hide();
    // アドレスを表示
    let d = aztool.option_add.azxp;
    let c, i, j, s;
    s = (d[0])? aztool.to_hex(d[0]): "未選択";
    $("#azxp_addr").html(s);
    // マトリックススキャンのタイプを選択
    $("#azxp_scan_type").val(d[1]);
    // ピン設定のセレクトボックスを入れる
    for (i=0; i<16; i++) {
        h = "";
        for (j in aztool.azxp_pin_set_list) {
            c = (d[i+2] == j)? " selected": "";
            h += "<option value='" + j + "'" + c + ">" + aztool.azxp_pin_set_list[j] + "</option>";
        }
        $("#azxp_pin_"+i).html(h);
    }
    aztool.update_step_box(2);
};

// アドレス設定モーダルオープン
aztool.addazxp_stpaddr_open = function() {
    aztool.stpaddr.open_select_addr(
        aztool.option_add.azxp[0], // 現在設定しているアドレス
        {"type": "azxp"}, // オプション type=1 => AZエキスパンダ
        function(click_type, set_data) {
            // 変更があればアドレスを変更
            let s = "";
            if (click_type == 1) {
                aztool.option_add.azxp[0] = set_data.addr;
                s = (set_data.addr)? aztool.to_hex(set_data.addr): "未選択";
                $("#azxp_addr").html(s);
            }
        }
    );
};

// 入力をチェックしてAZエキスパンダの設定を保持
aztool.addazxp_ioset_set = function() {
    let check_data = [];
    let c, i, r;
    // フォームの入力値取得
    check_data.push(aztool.option_add.azxp[0]); // アドレス
    check_data.push(parseInt($("#azxp_scan_type").val())); // スキャンのタイプ
    for (i=0; i<16; i++) {
        check_data.push(parseInt($("#azxp_pin_"+i).val())); // 各ピンの設定
    }
    // アドレス未設定
    if (!check_data[0]) {
        $("#pin_error").html("AZエキスパンダのアドレスを設定して下さい");
        return;
    }
    // row, col どちらかしかない
    c = 0; r = 0;
    for (i=0; i<16; i++) {
        c += (check_data[i+2] == 2)? 1: 0; // col
        r += (check_data[i+2] == 3)? 1: 0; // row
    }
    if (c && !r) {
        $("#pin_error").html("ROWピンを設定して下さい");
        return;
    }
    if (!c && r) {
        $("#pin_error").html("COLピンを設定して下さい");
        return;
    }
    // ロータリーチェック
    for (i=4; i<=11; i++) { // ロータリーA ～ ロータリーI ループ
        // ピン0 ～ ピン15 にロータリーnの数を数える
        c = 0;
        for (j=2; j<18; j++) {
            c += (check_data[j] == i)? 1: 0;
        }
        // 設定数が2ピン以外ならエラー
        if (c != 0 && c != 2) {
            $("#pin_error").html(aztool.azxp_pin_set_list[i]+" は2ピン設定して下さい");
            return;
        }
    }
    // チェックOKならデータを更新
    aztool.option_add.azxp = check_data;
    // AZエキスパンダに設定を送信
    $("#azxp_ioset_btn").hide();
    aztool.write_azxp_setting(aztool.option_add.azxp[0], aztool.option_add.azxp, function(stat) {
        // 書込み失敗
        if (stat != 0) {
            $("#pin_error").html("AZエキスパンダに設定を書き込めませんでした");
            $("#azxp_ioset_btn").show();
            return;
        }
        // 書込みが成功したらキーの数やデータバイト数を取得
        setTimeout(function() {
            aztool.read_azxp_key_info(aztool.option_add.azxp[0], function(stat, res) {
                // 読み込み失敗
                if (stat != 0) {
                    $("#pin_error").html("AZエキスパンダからデータを読み込めませんでした");
                    $("#azxp_ioset_btn").show();
                    return;
                }
                // 成功したら情報を保持
                aztool.option_add.azxp_info = res;
                // 入力確認を開始する
                aztool.addazxp_iocheck_view();
            });
        }, 500); // AZエキスパンダが再起動するのでちょっと待つ
    });
};

// IOピンの入力状態を確認する
aztool.option_add_read_check_exec_azxp = function(step_no) {
    // AZエキスパンダからキー入力を取得
    aztool.read_azxp_key(aztool.option_add.azxp[0], aztool.option_add.azxp_info.byte, function(stat, res) {
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_data = res;
        let t = 50;
        aztool.opt_read_check_update_func(); // 画面の情報を更新
        if (aztool.step_index != step_no) return; // 別のステップに移動したらチェックを止める
        setTimeout(function() { aztool.option_add_read_check_exec(step_no); }, t); // 次の情報を取得
    });
};

// 取得したIOピン入力状態を画面に反映する
aztool.option_add_azxp_check_update = function () {
    let b, d, i, s;
    let h = "";
    h += "<table>";
    h += "<tr><td>Data: </td><td>";
    for (i=0; i<aztool.option_add.azxp_info.len; i++) {
        b = Math.floor(i / 8);
        s = 0x01 << (i % 8);
        h += (aztool.opt_read_data[b] & s)? "<div class='check_on'></div>": "<div class='check_off'></div>";
        if ((i % 16) == 15) h += "<br>";
    }
    h += "</td></tr>";
    h += "</table>";
    $("#read_check_info").html(h);
};

// AZエキスパンダ入力確認画面表示
aztool.addazxp_iocheck_view = function() {
    let h = `
        キースイッチを押すとDataが緑色になる事を確認して下さい。<br>
        <div id="read_check_info" style="height: 120px;"></div>
        <div style="text-align: right; width: 800px;">
        <a class="cancel-button" onClick="javascript:aztool.addazxp_ioset_view();">戻る</a>
        　<a class="exec-button" onClick="javascript:aztool.addazxp_keymap_view();">次へ</a>
        </div>`;
    $("#option_setting_form").html(h);
    $("#kle_view_box").show();
    $("#kle_view_box_info").show();
    aztool.update_step_box(3);
    setTimeout(function() {
        aztool.read_check_index = 0;
        aztool.opt_read_data = [];
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_check_update_func = aztool.option_add_azxp_check_update; // 画面更新用関数
        aztool.option_add_read_health_check(3); // 入力取得が止まって無いか監視
        aztool.option_add_read_check_exec(3); // 入力取得開始
    }, 200);
};

// AZエキスパンダキーマッピング画面表示
aztool.addazxp_keymap_view = function() {
    let h = `
        <div id="btnmap_info">赤色になったキースイッチを押して下さい。</div>
        <div id="read_check_info" style="height: 120px;"></div>
        <div style="text-align: right; width: 800px;">
        <a class="cancel-button" onClick="javascript:aztool.addazxp_iocheck_view();">戻る</a>
        <div id="switch_comp_btn" style="display: none;">　<a class="exec-button" onClick="javascript:aztool.option_addazxp_btncheck_view();">次へ</a></div>
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
        aztool.opt_read_check_update_func = aztool.option_addazxp_keymap_update_func; // 画面更新用関数
        aztool.option_add_read_health_check(4); // 入力取得が止まって無いか監視
        aztool.option_add_read_check_exec(4); // 入力取得開始
    }, 700);
};

// キーの入力状態を取得
aztool.option_addazxp_keymap_update_func = function() {
    let b, i, j, f = -1, s;
    aztool.option_add_azxp_check_update();
    // ボタンが押されてるキーを探す(最初の１つだけ取得)
    for (i=0; i<aztool.option_add.azxp_info.len; i++) {
        b = Math.floor(i / 8);
        s = 0x01 << (i % 8);
        if (aztool.opt_read_data[b] & s) {
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
aztool.option_addazxp_btncheck_view = function() {
    let h = `
        <div id="btncheck_info">キースイッチを押して該当のスイッチの色が変わるのを確認して下さい。</div>
        <div id="read_check_info" style="height: 120px;"></div>
        <div style="text-align: right; width: 800px;">
        <a class="cancel-button" onClick="javascript:aztool.addazxp_keymap_view();">戻る</a>
        　<a class="exec-button" onClick="javascript:aztool.option_addazxp_save();">次へ</a>
        </div>`;
    $("#option_setting_form").html(h);
    aztool.update_step_box(5);
    setTimeout(function(){
        aztool.read_check_index = 0;
        aztool.opt_read_data = [];
        aztool.opt_read_lasttime = webhid.millis();
        aztool.opt_read_check_update_func = aztool.option_addazxp_map_check_update; // 画面更新用関数
        aztool.option_add_read_health_check(5); // 入力取得が止まって無いか監視
        aztool.option_add_read_check_exec(5); // 入力取得開始
    }, 700);
};

// マッピングの入力チェック
aztool.option_addazxp_map_check_update = function() {
    let b, i, s, x;
    aztool.option_add_azxp_check_update();
    // ボタンが押されてるキーを探す(最初の１つだけ取得)
    for (i in aztool.option_add.map) {
        x = aztool.option_add.map[i];
        b = Math.floor(x / 8);
        s = 0x01 << (x % 8);
        if (aztool.opt_read_data[b] & s) {
            $("#sw_" + i).css({"background-color": aztool.enable_key_color}); // 押しているキー
        } else {
            $("#sw_" + i).css({"background-color": aztool.key_color}); // 押していないキー
        }
    }
};

// 設定内容を保存
aztool.option_addazxp_save = function() {
    // 保存中画面表示
    let h = `
        <div id="btncheck_info">設定内容を保存中</div>
        <div id="console_div" style="height: 120px;"></div>
        <div style="text-align: right; width: 800px;">
        <div id="switch_resave_btn" style="display: none;">　<a class="exec-button" onClick="javascript:aztool.option_addazxp_save();">保存再実行</a></div>
        </div>`;
    $("#option_setting_form").html(h);
    aztool.update_step_box(6);
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
            let set_data = aztool.option_add_get_save_data_azxp();
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

// I2Cオプションに追加するデータを取得する IOエキスパンダ
aztool.option_add_get_save_data_azxp = function() {
    return {
        "id": aztool.option_add.id, // オプションごとのユニークなID
        "type": 5, // オプションのタイプ AZエキスパンダ
        "enable": 1, // 有効かどうか
        "setting": aztool.option_add.azxp, // 繋げているIOエキスパンダの設定
        "map_start": aztool.get_map_start_next(), // キー設定番号の開始位置
        "map": aztool.option_add.map // キーと読み込んだデータとのマッピング設定
    };
};
