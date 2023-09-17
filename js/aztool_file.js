// ファイル操作

if (!window.aztool) aztool = {};



// 全設定をZIPに固めてダウンロード
aztool.file_export_all = function() {
    aztool.view_message("<div id='export_info'>データ取得中</div><br><br><br><div id='console_div'></div>");
    aztool.file_zip = new Zlib.Zip();
    webhid.get_file_list(function(stat, res) {
        if (stat != 0) return;
        // ファイルリスをダウンロードリストに追加
        aztool.file_list = res.list;
        // ファイルデータを取得してZIPデータに追加していく
        aztool.file_add_file_zip();
    });
};

// ファイルを取得してZIPデータに追加
aztool.file_add_file_zip = function() {
    $("#export_info").html("データ取得中　残り " + aztool.file_list.length + " ファイル");
    // 全ファイル圧縮し終えたらダウンロード
    if (!aztool.file_list.length) {
        let comp = aztool.file_zip.compress();
        let file_name = aztool.setting_json_data.keyboard_name + ".zip";
        aztool.data_download(file_name, comp, "application/zip");
        // トップメニュー表示
        setTimeout(aztool.view_top_menu, 500);
        return;
    }
    // ファイルデータを取得
    let f = aztool.file_list.pop();
    // 起動回数ファイルは無視
    if (f.name == "/boot_count") {
        // 次のファイルを取得する
        setTimeout(aztool.file_add_file_zip, 200);
        return;
    }
    console.log("file: " + f.name);
    webhid.get_file(f.name, function(stat, res) {
        // 失敗したら諦めて次のファイル
        if (stat != 0) {
            console.log("error: get_file status " + stat);
            setTimeout(aztool.file_add_file_zip, 200);
            return;
        }
        // 成功したらZIPにデータ追加
        console.log(res);
        aztool.file_zip.addFile(res, {"filename": webhid.str2arr(f.name.substr(1)), "os": 0});
        // 次のファイルを取得する
        setTimeout(aztool.file_add_file_zip, 200);
    });
};

// インポートモーダル表示
aztool.file_import_modal_open = function() {
    let h = "";
    h += "<center style='margin: 50px; 100px'>";
    h += "<div style='margin: 50px;'>";
    h += "<input id='import_file' type='file' accept='.zip'><br>";
    h += "<div id='import_info'>　</div>";
    h += "</div>";
    h += "<a class='cancel-button' onClick='javascript:aztool.remodal_close();'>閉じる</a>";
    h += "　　　　<a id='import_file_exec' class='exec-button' onClick='javascript:aztool.file_import_file();'>インポート</a>";
    h += "</center>";
    aztool.remodal_open(h, {"max-width": "", "width": "", "min-height": ""});
};

// ファイルを開いて設定をインポートする
aztool.file_import_file = function() {
    let zip_file = $("#import_file").prop("files")[0];
    if (!zip_file) {
        $("#import_info").html("ファイルが選択されていません");
        return;
    }
    // モーダルを閉じる
    aztool.remodal_close();
    aztool.view_message("<div id='import_info'>データリセット中</div><br><br><br><div id='console_div'></div>");
    // ファイルデータを取得
    let fr = new FileReader();
    fr.onload = function() {
        let arr = new Uint8Array(fr.result);
        aztool.file_import_all(arr);
    };
    fr.readAsArrayBuffer(zip_file);
};

// 設定ファイルをインポート
aztool.file_import_all = function(zipArr) {
    // ZIPを解凍してファイルリスト取得
    aztool.file_unzip = new Zlib.Unzip(zipArr);
    aztool.file_list = aztool.file_unzip.getFilenames();
    // ESP32内の全ファイル削除
    webhid.all_remove(function() {
        $("#import_info").html("データ展開中");
        // 渡されたファイルを解凍してESP32に入れていく
        aztool.file_drop_file_zip();
    });
};

// 1ファイル分読み込んで解凍
aztool.file_drop_file_zip = function() {
    $("#import_info").html("データ展開中　残り " + aztool.file_list.length + " ファイル");
    // 全ファイル展開したらESP再起動
    if (!aztool.file_list.length) {
        setTimeout(function() {
            aztool.remodal_close();
            aztool.keyboard_restart(0); // キーボードモードで再起動
        }, 500); // 一応 0.5 秒待ってから
        return;
    }
    // ファイルデータを取得
    let f = aztool.file_list.pop();
    let fp = f.slice(f.indexOf("/"));
    let file_data = aztool.file_unzip.decompress(f);
    if (fp.slice(0,1) != "/") fp = "/" + fp;
    console.log("file path : " + fp);
    console.log(file_data);
    webhid.save_file(fp, file_data, function(stat) {
        // 失敗したらスキップして次のファイル
        if (stat != 0) {
            setTimeout(aztool.file_drop_file_zip, 200);
            return;
        }
        // 次のファイルを解凍する
        setTimeout(aztool.file_drop_file_zip, 200);
    });

};