// wifi 設定

if (!window.aztool) aztool = {};

// wifi 設定ページ表示
aztool.view_wifi_top = function() {
    // wifi設定が無ければ空の配列作成
    if (!aztool.setting_json_data.wifi) aztool.setting_json_data.wifi = [];
    let h = `
    <div  style="width: 1400px;">
    <table><tr><td class="leftmenu-box">
    <a class="leftmenu-button" onClick="javascript:aztool.view_wifi_addap();">Wifi 接続設定</a><br>
    <a class="leftmenu-button" onClick="javascript:aztool.view_top_menu();">戻る</a><br>
    </td><td valign="top" style="padding: 20px;">
    <div id='wifi_setting_box' style='width: 1000px; height: 750px;overflow: hidden; text-align: left;'></div>
    </td></tr></table>
    `;
    $("#main_box").html(h);
    // 接続設定ページ表示
    aztool.view_wifi_aplist();

};

// 接続設定ページ表示
aztool.view_wifi_aplist = function() {
    let i, w;
    let h = "";
    h += "<h2>Wifi 接続設定</h2>";
    for (i in aztool.setting_json_data.wifi) {
        w = aztool.setting_json_data.wifi[i];
        h += "<div class='conn_bbutton' style='width: 400px; display: block; margin: 10px 0;' onClick='javascript:aztool.wifi_editap_open("+i+");'>"+w.ssid+"</div>";
    }
    if (aztool.setting_json_data.wifi.length) h += "<br><br>";
    h += "<div class='conn_bbutton' onClick='javascript:aztool.open_wifi_addap();'>接続先 追加</div>";
    $("#wifi_setting_box").html(h);
};

// アクセスポイント追加モーダルを開く
aztool.open_wifi_addap = function() {
    // モーダルを開く
    let h = "";
    let cbtn = "<a href='#' class='cancel-button' onClick='javascript:aztool.close_wifi_modal();'>キャンセル</a>"; // キャンセルボタン
    let svbtn = "<a class='exec-button' onClick='javascript:aztool.wifi_addap_save();'>決定</a>"; // 保存ボタン
    h += "<h2>接続先 追加</h2>";
    h += "<div id='addap_main_box' style='margin: 50px 0;'></div>";
    h += "<div id='addap_btn_box' style='margin: 100px 0 0 0;'></div>";
    $("#util_remodal").html(h);
    $("#addap_main_box").html("アクセスポイント検索中 ...");
    aztool.util_remodal.open();
    // アクセスポイントを取得
    webhid.get_ap_list(function(stat, res) {
        // 失敗
        if (stat != 0) {
            $("#addap_main_box").html("アクセスポイントを取得できませんでした。");
            $("#addap_btn_box").html(cbtn);
            return;
        }
        // 結果を取得
        let res_data = JSON.parse(webhid.arr2str(res));
        if (!res_data) {
            console.log(webhid.arr2str(res));
            $("#addap_main_box").html("アクセスポイントデータに不備がありました。");
            $("#addap_btn_box").html(cbtn);
            return;
        }
        // 結果を表示
        let i, v;
        let h = "";
        h += "<table style='display: inline-block;'>";
        h += "<tr><td style='font-size: 20px; text-align: right;'>SSID：</td><td>"
        h += "<select id='addap_ssid' style='font-size: 20px; margin: 20px; padding: 10px; width: 260px;'>";
        for (i in res_data.list) {
            v = res_data.list[i].ssid;
            h += "<option value='"+v+"'>" +v+ "</option>";
        }
        h += "</select></td></tr>";
        h += "<tr><td style='font-size: 20px; text-align: right;'>パスワード：</td><td>"
        h += "<input id='addap_pass' type='password' style='font-size: 20px; margin: 20px; padding: 10px; width: 260px;'>";
        h += "</td></tr></table>";
        $("#addap_main_box").html(h);
        $("#addap_btn_box").html(cbtn +"　　　　"+ svbtn);

    });
};

// モーダルを閉じる
aztool.close_wifi_modal = function() {
    aztool.util_remodal.close();
};

// 接続先追加
aztool.wifi_addap_save = function() {
    // 入力したデータを追加
    aztool.setting_json_data.wifi.push({"ssid": $("#addap_ssid").val(), "pass": $("#addap_pass").val()});
    // モーダルを閉じる
    aztool.util_remodal.close();
    // 接続設定ページ表示
    aztool.view_wifi_aplist();
};

// 接続先編集モーダルを開く
aztool.wifi_editap_open = function(n) {
    // モーダルを開く
    let w = aztool.setting_json_data.wifi[n];
    let h = "";
    h += "<h2>接続先 編集</h2>";
    h += "<div id='addap_main_box' style='margin: 50px 0;'>";
    h += "<table style='display: inline-block;'>";
    h += "<tr><td style='font-size: 20px; text-align: right;'>SSID：</td><td>"
    h += "<input id='editap_ssid' type='text' style='font-size: 20px; margin: 20px; padding: 10px; width: 260px;'>";
    h += "</td></tr>";
    h += "<tr><td style='font-size: 20px; text-align: right;'>パスワード：</td><td>"
    h += "<input id='editap_pass' type='password' style='font-size: 20px; margin: 20px; padding: 10px; width: 260px;'>";
    h += "</td></tr></table>";
    h += "</div>";
    h += "<div id='addap_btn_box' style='margin: 100px 0 0 0;'>";
    h += "<a href='#' class='cancel-button' onClick='javascript:aztool.close_wifi_modal();'>閉じる</a>";
    h += "　　　　<a class='exec-button' onClick='javascript:aztool.wifi_editap_remove("+n+");'>削除</a>";
    h += "　　　　<a class='exec-button' onClick='javascript:aztool.wifi_editap_save("+n+");'>保存</a>";
    h += "</div>";
    $("#util_remodal").html(h);
    $("#editap_ssid").val(w.ssid);
    $("#editap_pass").val(w.pass);
    aztool.util_remodal.open();
};

// 接続先保存
aztool.wifi_editap_save = function(n) {
    // 入力したデータを保存
    aztool.setting_json_data.wifi[n] = {"ssid": $("#addap_ssid").val(), "pass": $("#addap_pass").val()};
    // モーダルを閉じる
    aztool.util_remodal.close();
    // 接続設定ページ表示
    aztool.view_wifi_aplist();
};

// 接続先削除
aztool.wifi_editap_remove = function(n) {
    // 指定した接続を削除
    aztool.setting_json_data.wifi.splice(n, 1);
    // モーダルを閉じる
    aztool.util_remodal.close();
    // 接続設定ページ表示
    aztool.view_wifi_aplist();
};
