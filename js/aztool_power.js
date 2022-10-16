// 省電力モードの設定

if (!window.aztool) aztool = {};

// 省電力モードの設定モーダルオープン
aztool.power_saving_setting_open = function() {
    // モーダルを開く
    let h = "";
    h += "<h2>省電力モードの設定</h2>";
    h += "<div id='saving_main_box' style='margin: 0;'>";
    h += "<table style='display: inline-block; font-size: 16px;'>";
    h += "<tr><td style='font-size: 20px; text-align: right;'>省電力モード：</td><td>"
    h += "<select id='sv_mode' style='font-size: 20px; margin: 20px; padding: 10px; width: 140px; text-align: center;'>";
    h += "<option value='0'>OFF</option>";
    h += "<option value='1'>ON</option>";
    h += "</select>";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 20px; text-align: right;'>通常時インターバル：</td><td>"
    h += "<input id='sv_interval_normal' type='number' style='font-size: 20px; margin: 20px; padding: 10px; width: 200px; text-align: center;'> ミリ秒";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 20px; text-align: right;'>省電力時インターバル：</td><td>"
    h += "<input id='sv_interval_saving' type='number' style='font-size: 20px; margin: 20px; padding: 10px; width: 200px; text-align: center;'> ミリ秒";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 20px; text-align: right;'>省電力モードになるまでの時間：</td><td>"
    h += "<input id='sv_saving_time' type='number' style='font-size: 20px; margin: 20px; padding: 10px; width: 200px; text-align: center;'> 秒";
    h += "</td></tr>";
    h += "</table>";
    h += "</div>";
    h += "<div id='saving_info' style='color: #ff5959;'></div>";
    h += "<div style='font-size: 15px; color: #888; text-align: left; margin: 0 260px;'>※ インターバルが長いほど省電力になりますが入力のラグが発生しやすくなります。<br>";
    h += "※ キー入力があると通常時のインターバルになります。<br>";
    h += "※ 最後の入力から設定秒数経過すると省電力時のインターバルに切り替わります。</div>";
    h += "<div id='addap_btn_box' style='margin: 80px 0 0 0;'>";
    h += "<a href='#' class='cancel-button' onClick='javascript:aztool.power_saving_setting_close(0);'>キャンセル</a>";
    h += "　　　　<a class='exec-button' onClick='javascript:aztool.power_saving_setting_close(1);'>決定</a>";
    h += "</div>";
    aztool.remodal_open(h); // モーダルオープン
    aztool.power_saving_setting_set(); // 設定をフォームに反映
};

// 省電力モードの設定をフォームに入れる
aztool.power_saving_setting_set = function() {
    let k;
    let s_def = {"mode": 0, "interval_normal": 35, "interval_saving": 120, "saving_time": 5};
    let s = (aztool.setting_json_data.power_saving)? aztool.clone(aztool.setting_json_data.power_saving): s_def;
    // 項目が無い場合はデフォルトを指定
    for (k in s_def) if (!s[k]) s[k] = s_def[k];
    // フォームに値を入れる
    $("#sv_mode").val(s.mode + "");
    $("#sv_interval_normal").val(s.interval_normal + "");
    $("#sv_interval_saving").val(s.interval_saving + "");
    $("#sv_saving_time").val(s.saving_time + "");
};

// 省電力モードの設定モーダルを閉じる
aztool.power_saving_setting_close = function(save_flag) {
    // 決定が押された場合はフォームの入力内容を設定配列に反映
    if (save_flag) {
        let i_n = parseInt($("#sv_interval_normal").val());
        let i_s = parseInt($("#sv_interval_saving").val());
        let st = parseInt($("#sv_saving_time").val());
        if (i_n < 15 || i_n > 500) {
            $("#saving_info").html("通常時インターバルは15-500の間で指定して下さい。");
            return;
        }
        if (i_s < 15 || i_s > 500) {
            $("#saving_info").html("省電力時インターバルは15-500の間で指定して下さい。");
            return;
        }
        if (st < 0 || st > 3600) {
            $("#saving_info").html("省電力モードになるまでの時間は0-3600の間で指定して下さい。");
            return;
        }
        aztool.setting_json_data.power_saving = {
            "mode": parseInt($("#sv_mode").val()),
            "interval_normal": i_n,
            "interval_saving": i_s,
            "saving_time": st
        };
    }
    aztool.remodal_close();
    // トップメニューを描画しなおす
    aztool.view_top_menu();
};

