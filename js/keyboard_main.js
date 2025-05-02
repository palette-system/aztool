var keyboard_main = {};

keyboard_main.keyboard_edit_data = {};

keyboard_main.init = function() {
    $("#main_box").html("");
    // キーボードリスト表示
    keyboard_main.view_keyboard_list();
};

// キーボードリスト表示
keyboard_main.view_keyboard_list = function() {
    $("#main_box").html("キーボードリスト取得中");
    aztool.get_keyboard_list(function() {
        var k, h ="";
        h += "<div style='font-size: 30px;'>⌨ AZTOOL 登録キーボードリスト</div><br><br>";
        h += "<div class='setup_menu_btn' onClick='javascript:keyboard_main.keyboard_edit(-1);'>";
        h += "<img class='setup_menu_img' style='height: 120px;' src='./img/custam_icon.jpg'><br>";
        h += "<div class='setup_menu_title'>新しくキーボードを登録する</div>";
        h += "</div>";    
        for (i in aztool.setup_keyboard_list) {
            k = aztool.setup_keyboard_list[i];
            h += "<div class='setup_menu_btn' onClick='javascript:keyboard_main.keyboard_edit(" + i + ");'>";
            h += "<img class='setup_menu_img' src='" + k.url.image + "'><br>";
            h += "<div class='setup_menu_title'>" + k.name + "</div>";
            h += "</div>";    
        }
        $("#main_box").html(h);
    });
};

// キーボード情報編集
keyboard_main.keyboard_edit = function(key_id) {
    var h = "";
    if (key_id < 0) {
        // 新規追加
        h += "<div style='font-size: 30px;'>⌨ AZTOOL 新規キーボード登録</div><br><br>";
        keyboard_main.keyboard_edit_data = {"id": 0, "name": "", "github": "", "password": ""};
    } else {
        // 変更
        h += "<div style='font-size: 30px;'>⌨ AZTOOL キーボード情報変更</div><br><br>";
        keyboard_main.keyboard_edit_data = aztool.setup_keyboard_list[key_id];
    }
    var k = keyboard_main.keyboard_edit_data;
    h += "<table>";
    h += "<tr>";
    h += "<td>キーボード名：</td>";
    h += "<td><input type='text' id='key_name' value='"+k.name+"' style='font-size: 20px; width: 300px;'></td>";
    h += "</tr>";
    h += "<tr>";
    h += "<td>Github URL：</td>";
    h += "<td><input type='text' id='key_github' value='"+k.github+"' style='font-size: 20px; width: 700px;'></td>";
    h += "</tr>";
    h += "<tr>";
    h += "<td>編集パスワード：</td>";
    h += "<td><input type='password' id='key_password' value='' style='font-size: 20px; width: 200px;'></td>";
    h += "</tr>";
    h += "</table>";
    h += "<br>";
    h += "<div id='status_box'></div>";
    h += "<br>";
    h += "<div id='edit_btn'>";
    h += "<a class='cancel-button' onClick='javascript:keyboard_main.view_keyboard_list();'>戻る</a>";
    h += "　　<a class='exec-button' onClick='javascript:keyboard_main.keyboard_delete();'>削除</a>";
    h += "　　<a class='exec-button' onClick='javascript:keyboard_main.keyboard_edit_save(0);'>保存</a>";
    h += "</div>";

    $("#main_box").html(h);
};

// 保存
keyboard_main.keyboard_edit_save = function(delete_flag) {
    var send_dype = (delete_flag == 1)? "削除": "保存";
    $("#edit_btn").hide();
    $("#status_box").html(send_dype + "中・・・");
    var prm = {};
    prm["id"] = keyboard_main.keyboard_edit_data.id;
    prm["name"] = $("#key_name").val();
    prm["github"] = $("#key_github").val();
    prm["password"] = $("#key_password").val();
    prm["password"] = $("#key_password").val();
    prm["delete_flag"] = "" + delete_flag;
    aztool.save_keyboard_data(prm, function(stat, res) {
        if (stat) {
            $("#status_box").html("予期せぬエラーが発生しました");
            $("#edit_btn").show();
            return;
        }
        if (!res.message || res.message != "OK") {
            $("#status_box").html(send_dype + "失敗しました： " + res.message);
            $("#edit_btn").show();
            return;
        }
        $("#status_box").html(send_dype + "しました");
        setTimeout(keyboard_main.view_keyboard_list, 2000);
    });
};

// 削除
keyboard_main.keyboard_delete = function() {
    var res = window.confirm(keyboard_main.keyboard_edit_data.name + " を削除しますか？");
    if (res) {
        keyboard_main.keyboard_edit_save(1);
    }
};
