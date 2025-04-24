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
        setTimeout(aztool.view_top_menu, 1000);
        return;
    }
    // ファイルデータを取得
    let f = aztool.file_list.pop();
    // 起動回数ファイルは無視
    if (f.name == "/boot_count") {
        // 次のファイルを取得する
        setTimeout(aztool.file_add_file_zip, 1000);
        return;
    }
    console.log("file: " + f.name);
    webhid.get_file(f.name, function(stat, res) {
        // 失敗したら諦めて次のファイル
        if (stat != 0) {
            console.log("error: get_file status " + stat);
            setTimeout(aztool.file_add_file_zip, 1000);
            return;
        }
        // 成功したらZIPにデータ追加
        console.log(res);
        aztool.file_zip.addFile(res, {"filename": webhid.str2arr(f.name.substr(1)), "os": 0});
        // 次のファイルを取得する
        setTimeout(aztool.file_add_file_zip, 1000);
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
        }, 1000); // 一応 0.5 秒待ってから
        return;
    }
    // ファイルデータを取得
    let f = aztool.file_list.pop();
    let fp = (f.indexOf("/") >= 0)? f.slice(f.indexOf("/")): f;
    let file_data = aztool.file_unzip.decompress(f);
    if (fp.slice(0,1) != "/") fp = "/" + fp;
    console.log("file path : " + fp + " ("+f+")");
    console.log(file_data);
    webhid.save_file(fp, file_data, function(stat) {
        // 失敗したらスキップして次のファイル
        if (stat != 0) {
            setTimeout(aztool.file_drop_file_zip, 1000);
            return;
        }
        // 次のファイルを解凍する
        setTimeout(aztool.file_drop_file_zip, 1000);
    });

};

// 指定したURLのファイルをダウンロードする
aztool.ajax_array_buffer = function(src, cb_func) {
    if (!cb_func) cb_func = function() {};
    var xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);
    xhr.responseType = "arraybuffer"; // arraybuffer blob text json 
    xhr.onload = function(e) {
        if (xhr.status == 200) {
            cb_func(0, xhr);
        } else {
            cb_func(1, xhr);
        }
    };
    xhr.send();
};

// 指定したURLにPOSTしてのファイルをダウンロードする
aztool.post_array_buffer = function(src, param, headers, cb_func) {
    if (!cb_func) cb_func = function() {};
    if (!headers) header = {};
    var k;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", src, true);
    for (k in headers) xhr.setRequestHeader(k, headers[k]);
    xhr.responseType = "arraybuffer"; // arraybuffer blob text json 
    xhr.onload = function(e) {
        if (xhr.status == 200) {
            cb_func(0, xhr);
        } else {
            cb_func(1, xhr);
        }
    };
    var json_str = JSON.stringify(param);
    xhr.send(json_str);
};

// GAS用 POST
aztool.post_array_buffer_gas = function(src, param, cb_func) {
    var head = {"Content-Type": "application/x-www-form-urlencoded"};
    aztool.post_array_buffer(src, param, head, cb_func);
}


// 指定したURLのZIPをインポートする
aztool.file_import_url = function(src, cb_func) {
    if (!cb_func) cb_func = function() {};
    aztool.view_message("<div id='import_info'>ZIPロード中</div><br><br><br><div id='console_div'></div>");
    aztool.ajax_array_buffer(src, function(stat, res) {
        // エラー
        if (stat > 0) {
            cb_func(1, null);
            return;
        }
        // ZIPデータがロードできていればインポート実行
        console.log(res);
        let arr = new Uint8Array(res.response);
        console.log(arr);
        aztool.file_import_all(arr);
    });
};

// Github からZIPをダウンロードしてインポートする
aztool.github_import_file = function(github_src, github_path, cb_func) {
    if (!cb_func) cb_func = function() {};
    aztool.post_array_buffer_gas(
        aztool.gas_api, 
        {"type": "file", "github": github_src, "path": github_path}, 
        function(s,r) {
            if (s) {
                cb_func(s, null);
                return;
            }
            var json_arr = new Uint8Array(r.response);
            var res = JSON.parse(webhid.arr2str(json_arr)); 
            var zip_arr = new Uint8Array(res.data);
            console.log(zip_arr);
            aztool.file_import_all(zip_arr);
        }
    );
        
};
