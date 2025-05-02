
var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var keyboard_sheet = spreadsheet.getSheetByName('keyboards');

var col_ids = {};
var col_codes = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

// md5 
function create_md5(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input, Utilities.Charset.UTF_8);
  var txtHash = '';
  for (i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

// 現在日時
function get_now() {
  var d = new Date();
  return Utilities.formatDate(d, "Asia/Tokyo", "yyyy/MM/dd hh:mm:ss");
}

// Github URL から画像とインポート用の URL を作成する
function create_github_url(main_url) {
    var i;
    var url_data = main_url.split("/");
    var github_user = url_data[3]; // github ユーザー名
    var github_repo = url_data[4]; // リポジトリ名
    var github_branch = url_data[6]; // ブランチ名
    var github_path = "";
    for (i in url_data) {
        if (i < 7) continue;
        github_path += "/" + url_data[i];
    }
    var base_url = "https://github.com/" + github_user + "/" + github_repo + "/raw/refs/heads/" + github_branch + github_path;
    var res = {
        "github_user": github_user,
        "github_repo": github_repo,
        "base": base_url,
        "image": base_url + "/main.jpg",
        "zip": base_url + "/import.zip"
    };
    return res;
};


// スプレットシートからキーボードリストを取得
function get_keyboard_list() {
  const data_range = keyboard_sheet.getRange('A1:G200');
  const data_list = data_range.getValues();
  var i, j, g, add_data, s;
  var res = [];
  var keys = [];

  // 1行目のヘッダ取得
  for (i in data_list[0]) {
    keys.push(data_list[0][i].toString());
  }
  for (i in keys) {
    col_ids[ keys[i] ] = i;
  }

  // データ取得
  for (i in data_list) {
    // 1行目はスキップ
    if (i == 0) continue;

    // IDが無ければスキップ
    s = data_list[i][0].toString();
    if (!s.length) continue;

    // 行のデータ作成
    add_data = {"row": parseInt(i) + 1};
    for (j in keys) {
      add_data[ keys[j] ] = data_list[i][j].toString();
    }

    // 削除フラグが1のデータはスキップ
    if (add_data["delete_flag"] == "1") continue;

    // github 情報も追加
    g = create_github_url(add_data["github"]);
    add_data["github_user"] = g["github_user"];
    add_data["github_repo"] = g["github_repo"];

    // レスポンスに追加
    res.push(add_data);
  }

  return res;
}

// キーボードリストのレスポンスを作成する
function create_keabords_response(keyboard_list) {
  var remove_key_list = ["row","password","create_date","update_date","delete_flag"];
  var res = {"data": []};
  var i, k, x;
  for (i in keyboard_list) {
    x = {};
    for (k in keyboard_list[i]) {
      if (remove_key_list.indexOf(k) >= 0) continue;
      x[k] = keyboard_list[i][k];
    }
    // レスポンスデータに追記
    res["data"].push(x);
  }
  return res;
}

// file Githubから指定したファイルをJSON返すレスポンスで返す
function get_github_file(param) {
    // file Githubから指定したファイルをJSON返すレスポンスで返す
    var i, urls, url, res, arr, buf = [];
    urls = create_github_url(param.github);
    url = urls["base"] + param.path;
    res = UrlFetchApp.fetch(url);
    arr = new Uint8Array(res.getContent());
    for (i=0; i<arr.byteLength; i++) { buf.push(arr[i]); }
    const response = ContentService.createTextOutput();
    response.setMimeType(MimeType.JSON);
    response.setContent(JSON.stringify({"data": buf}));
    return response;
}

// 送られてきたキーボードを保存する
function save_keyboard_data(param) {
    var i, k, cell_code;
    const response = ContentService.createTextOutput();
    response.setMimeType(MimeType.JSON);
    // スプレットシート上のキーボードリストを取得
    var keyboard_list = get_keyboard_list();
    // github パラメータチェック
    if (!param.github || !param.github.length) {
        response.setContent(JSON.stringify({"message": "github url は必須です"}));
        return response;
    }
    var github = param.github.split("/");
    if (github[2] != "github.com" || github[5] != "tree" || github.length < 6) {
        response.setContent(JSON.stringify({"message": "github url のURLが不正です"}));
        return response;
    }
    // name キーボード名パラメータチェック
    if (!param.name || !param.name.length) {
        response.setContent(JSON.stringify({"message": "キーボード名 は必須です"}));
        return response;
    }
    if (param.name.length > 30) {
        response.setContent(JSON.stringify({"message": "キーボード名 は30文字以内にして下さい"}));
        return response;
    }
    // password キーボード名パラメータチェック
    if (!param.password || !param.password.length) {
        response.setContent(JSON.stringify({"message": "パスワード は必須です"}));
        return response;
    }
    if (param.password.length < 4) {
        response.setContent(JSON.stringify({"message": "パスワードは 4文字以上設定して下さい"}));
        return response;
    }
    // delete_flag 削除フラグパラメータチェック
    if (param.delete_flag && param.delete_flag.length && param.delete_flag != "0" && param.delete_flag != "1") {
        response.setContent(JSON.stringify({"message": "削除フラグは 0 か 1 を指定して下さい"}));
        return response;
    }

    // データの登録
    if (!param.id || !param.id.length || parseInt(param.id) <= 0) {
      // ID のパラメータが無ければ新しく登録するので、既に存在するキーボードかどうかチェック
      // 既に登録されているGithubでないかチェック
      for (i in keyboard_list) {
        if (keyboard_list[i].github == param.github) {
          response.setContent(JSON.stringify({"message": keyboard_list[i].github+" は既に登録されています"}));
          return response;
        }
      }
      // 同じキーボード名のデータが無いかチェック
      for (i in keyboard_list) {
        if (keyboard_list[i].name == param.name) {
          response.setContent(JSON.stringify({"message": keyboard_list[i].name+" は既に登録されています"}));
          return response;
        }
      }
    } else {
      // 該当のIDのキーボードがあるかチェック
      k = null;
      for (i in keyboard_list) {
        if (parseInt(keyboard_list[i].id) == parseInt(param.id)) {
          k = keyboard_list[i];
        }
      }
      if (!k) {
          response.setContent(JSON.stringify({"message": "ID: " + param.id+" は登録されていません"}));
          return response;
      }
      // ID があれば更新になるのでパスワードのチェック
      if (create_md5(param.password) != k.password) {
          response.setContent(JSON.stringify({"message": "パスワード に問題があります"}));
          return response;
      }
      // 削除フラグを立てる
      cell_code = col_codes[col_ids["update_date"]] + k.row; // A1 とか
      keyboard_sheet.getRange(cell_code).setValue(get_now());
      cell_code = col_codes[col_ids["delete_flag"]] + k.row; // A1 とか
      keyboard_sheet.getRange(cell_code).setValue("1");
    }
    // 削除フラグ1でリクエストされた場合はレコード追加を行わない
    if (param.delete_flag && param.delete_flag.length && param.delete_flag == "1") {
      response.setContent(JSON.stringify({"message": "OK", "id": parseInt(k.id)}));
      return response;
    }
    // 最終行と最終IDを取得
    var last_row = 1, last_id = 0;
    for (i in keyboard_list) {
      if (keyboard_list[i].row > last_row) last_row = keyboard_list[i].row;
      if (parseInt(keyboard_list[i].id) > last_id) last_id = parseInt(keyboard_list[i].id);
    }
    // 最後の行とIDに1足して新しく追加する行とIDにする
    last_row++;
    last_id++;
    // スプレットシートに書き込む
    cell_code = col_codes[col_ids["id"]] + last_row; // A1 とか
    keyboard_sheet.getRange(cell_code).setValue(last_id);
    cell_code = col_codes[col_ids["name"]] + last_row; // A1 とか
    keyboard_sheet.getRange(cell_code).setValue(param.name);
    cell_code = col_codes[col_ids["github"]] + last_row; // A1 とか
    keyboard_sheet.getRange(cell_code).setValue(param.github);
    cell_code = col_codes[col_ids["password"]] + last_row; // A1 とか
    keyboard_sheet.getRange(cell_code).setValue(create_md5(param.password));
    cell_code = col_codes[col_ids["create_date"]] + last_row; // A1 とか
    keyboard_sheet.getRange(cell_code).setValue(get_now());
    cell_code = col_codes[col_ids["update_date"]] + last_row; // A1 とか
    keyboard_sheet.getRange(cell_code).setValue(get_now());
    cell_code = col_codes[col_ids["delete_flag"]] + last_row; // A1 とか
    keyboard_sheet.getRange(cell_code).setValue("0");
    // レスポンスを返す
    response.setContent(JSON.stringify({"message": "OK", "id": last_id}));
    return response;
}

// POST リクエストされた時に実行される関数
function doPost(e) {

  // リクエストパラメータ取得
  const req_str = e.postData.getDataAsString();
  // var req_str = '{"name":"nameaaaa", "github": "https://github.com/palette-system/az-core/tree/main/firmware/", "password": "nnnn"}';
  const param = JSON.parse(req_str);

  if (param.type == "file" && param.github.length > 0 && param.path.length > 0) {
    // file Githubから指定したファイルをJSON返すレスポンスで返す
    return get_github_file(param);

  } else if (param.type == "save") {
    // 送られてきたキーボードを保存する
    return save_keyboard_data(param);

  }

  // 不明なリクエストだった場合
  const response = ContentService.createTextOutput();
  response.setMimeType(MimeType.JSON);
  response.setContent(JSON.stringify({"message":"no match"}));
  return response;
}

// GET リクエストされた時に実行される関数
function doGet() {
    // スプレットシートからキーボードリストを取得
    const keyboard_list = get_keyboard_list();
    // レスポンス作成
    const response = ContentService.createTextOutput();
    response.setMimeType(MimeType.JSON);
    response.setContent(JSON.stringify(create_keabords_response(keyboard_list)));
    return response;  
}
