// 設定ファイルを選択して初期化する

if (!window.aztool) aztool = {};

aztool.firm_setup_enable = false;

aztool.firm_setup = function() {
    aztool.firm_setup_enable = true;
    let i;
    let h = "";
    h += "<div style='text-align: center; margin: 0;'>";
    h += "<h2 style='font-size: 80px; margin: 40px 0 100px 0;'>⌨ AZTOOL</h2>";
    h += "<br>";
    h += "接続しているキーボードを選択して下さい。<br>";
    h += "<br>";

    h += "<div class='conn_bbutton' onClick='javascript:aztool.addopt_start(\"main_box\", 100);'>オリジナル</div>";
    h += "<br>";

    h += "<div class='conn_bbutton' onClick='javascript:aztool.file_import_url(\"/aztool/data/ZIP_BLE.zip\");'>ZIP_BLE</div>";
    h += "<br>";

    h += "<div style='margin: 140px 0 0 0; height: 80px; line-height: 80px;'>";
    h += "<img src='./img/palette_system_logo.png' alt='パレットシステム'>"
    h += "</div>";
    h += "</div>";
    $("#main_box").html(h);

};
