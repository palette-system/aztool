// シリアル通信(赤外線)の動作を確認するモーダル

if (!window.aztool) aztool = {};

// モーダル用のHTML生成
aztool.irtest_init = function() {
    // モーダル用HTML登録
    let html = `
        <!-- シリアル通信(赤外線)の動作を確認するモーダル -->
        <div class="remodal azmodal" data-remodal-id="irtest_modal" 
                data-remodal-options="hashTracking: false, closeOnOutsideClick: false"
                style="max-width: 1200px; width: 1200px; min-height: 600px;padding: 50px 180px;">
            <div id="irtest_html" style='margin: 0; padding: 0;'><!-- 拡張仕様用 --></div>
            <div id="irtest_key_html" style='margin: 0; padding: 0;'></div>
            <div id="irtest_setting_html" style='margin: 0; padding: 0;'></div>
            <br><br><br>
            <div style="text-align: right;margin: 0 0 20px 0;">
            <a id="pin_set_cancel" class="cancel-button" onClick="javascript:aztool.irtest_close();">終了</a>
            </div>
        </div>`;
    $("body").append(html);
    // モーダル登録
    aztool.irtest_mdl = $('[data-remodal-id=irtest_modal]').remodal();
    aztool.irtest_mdl.settings.closeOnOutsideClick = false;
    aztool.irtest_mdl.settings.hashTracking = false;
    // 変数初期化
    aztool.keyact_flag = 0;
};

// シリアル通信(赤外線)の動作を確認するモーダルを開く
aztool.irtest_open = function(key_id) {
    webhid.set_aztool_mode(2, function() { // eztoolモード入力テスト中
        // モーダルを開く
        aztool.irtest_mdl.open();
        // キー入力テスト中にする
        aztool.keyact_flag = 1;
        // キー入力取得のループ開始
        aztool.irtest_read_loop();
    });
};

// シリアル通信(赤外線)の動作を確認するモーダルを閉じる
aztool.irtest_close = function() {
    aztool.keyact_flag = 0;
    webhid.set_aztool_mode(0, function() { // eztoolモード入力テスト終了
        aztool.irtest_mdl.close();
    });
};

// 受け取ったキー入力を表示
aztool.irtest_keyinput_view = function(key_data) {
    let i, s;
    s = "";
    s += "<table style='width: 800px; border: #ccc 4px solid; border-radius: 5px; padding: 5px; margin: 5px;'><tr>";
    s += "<td style='width: 100px; height: 100px; font-size: 20px; padding: 20px;'><b>入力キー</b></td><td>";
    for (i=1; i<32; i++) {
        if (key_data[i] == 0) continue;
        s += "<div style='border-radius: 10px; background-color:rgb(153, 194, 255); display: inline-block; margin: 5px; padding: 5px; width: 50px; height: 50px; font-size: 20px; text-align: center; line-height: 50px;'>";
        s += key_data[i]+"</div>";
    }
    s += "</td></tr></table>";
    $("#irtest_key_html").html(s);
};

// 受け取った設定情報表示
aztool.irtest_setinput_view = function(set_data) {
    let s, tr_style;
    let type_name = ["マトリックス","ダブルマトリックス","ダイレクト"];
    s = "";
    if (set_data[1] == 1) {
        // データタイプ1
        tr_style = (set_data[2] == 0)? 'background-color: rgb(153, 194, 255);': '';
        s += "<table style='width: 800px; border: #ccc 4px solid; border-radius: 5px; padding: 5px; margin: 5px; font-size: 20px;' cellspacing='0'>";
        s += "<tr style='"+tr_style+"'><td style='width: 200px; height: 70px; font-size: 20px; padding: 20px;'><b>スキャンタイプ</b></td>";
        s += "<td style='width: 50px;'><b>：</b></td><td>"+type_name[set_data[3]]+"</td></tr>";
        tr_style = (set_data[2] == 1)? 'background-color: rgb(153, 194, 255);': '';
        s += "<tr style='"+tr_style+"'><td style='width: 200px; height: 70px; font-size: 20px; padding: 20px;'><b>キー開始番号</b></td>";
        s += "<td style='width: 50px;'><b>：</b></td><td>"+set_data[4]+"</td></tr>";
        s += "</table>";
    } else {
        s += "<div style='height: 150px;'></div>";
    }
    $("#irtest_setting_html").html(s);
};

// キー入力を取得するループ
aztool.irtest_read_loop = function() {
    // キー入力を取得
    webhid.get_serial_input(function(read_key) {
        aztool.irtest_keyinput_view(read_key); // キー入力表示
        if (aztool.keyact_flag > 0) {
            // セッティング情報を取得する
            setTimeout(function() {
                webhid.get_serial_setting(function(read_setting) {
                    aztool.irtest_setinput_view(read_setting); // 設定情報表示
                    if (aztool.keyact_flag > 0) {
                        setTimeout(aztool.irtest_read_loop, 50);
                    }
                });
            }, 50);
        }
    });
};