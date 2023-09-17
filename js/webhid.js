var webhid = {};


// 接続したHIDデバイス
webhid.device = null;

// データをロードする時のstep計算用
webhid.load_index = 0;

// データをロードする時一気に何レコード受け取るか
webhid.load_step = 12;

// データをロードする容量
webhid.load_length = 0;

// ロードしたデータ
webhid.load_data = [];

// ロード時のハッシュを計算する用のデータ
webhid.load_hash = [];

// 最後にロードした時間
webhid.last_load_time = 0;

// 最後にロードしたポイント
webhid.last_load_point = 0;

// 最後に送ったハッシュ値
webhid.last_send_hash = 0;

// ロード中のファイルパス
webhid.load_file_path = "";

// 保存データ送信のインデックス
webhid.save_index = 0;

// 保存データを一気に何レコード送信するか
webhid.save_step = 0;

// 保存データを送信するデータの開始位置
webhid.save_seek = 0;

// 保存するデータ
webhid.save_data = [];

// 保存時のハッシュを計算する用のデータ
webhid.save_hash = [];

// 保存中のファイルパス
webhid.save_file_path = "";

// HID の usage ID
webhid.hid_usage = 0x61;
webhid.hid_usage_page = 0xff60;

// HID接続リクエスト用パラメータ
webhid.hid_request_prm = {filters: [{"usagePage": webhid.hid_usage_page, "usage": webhid.hid_usage}]};

// 送受信するポートの番号
webhid.raw_report_id = 0;

// インフォを表示するDIV
webhid.info_div = "";

// コマンドID
webhid.command_id = {
    "file_load_start": 0x30, // ファイル読み込み開始
    "file_load_data": 0x31, // ファイルデータ取得
    "file_save_start": 0x32, // ファイル保存開始
    "file_save_data": 0x33, // ファイル保存データ送信
    "file_save_complate": 0x34, // ファイル保存完了
    "file_remove": 0x35, // ファイル削除
    "all_remove": 0x36, // 全ファイル削除
    "file_rename": 0x37, // ファイル名変更
    "file_list": 0x38, // ファイルリストを取得する
    "disk_info": 0x39, // SPIFFSディスクの要領を取得
    "restart": 0x3A, // M5StackCore2の再起動
    "get_ioxp_key": 0x3B, // IOエキスパンダからキー入力を取得
    "set_aztool_mode": 0x3C, // aztoolモードフラグ設定
    "get_ap_list": 0x3D, // WIFIのアクセスポイントリスト取得
    "read_key": 0x3E, // キーの入力状態取得
    "get_rotary_key": 0x3F, // I2Cロータリーエンコーダの入力状態取得
    "get_pim_key": 0x40, // PIM447から入力情報を取得する
    "set_pin_set": 0x41, // 本体の direct, touch, row, col ピン設定をする
    "i2c_read": 0x42, // i2c からデータ読み込み
    "i2c_write": 0x43, // i2c へデータ書込み
    "get_analog_switch": 0x44, // スイッチデータ読み込み
    "set_analog_switch": 0x45, // アナログスイッチの設定をリアルタイム変更
    "none": 0x00 // 空送信
};

// 入力読み込み用
webhid.read_bit = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];

// 初期化
webhid.init = function(opt) {
    // オプションを受け取る
    let k;
    for (k in opt) {
        webhid[k] = opt[k];
    }
    // crcテーブル作成
    webhid.crc_table = webhid.get_crctable();
    // hid 対応していなければ何もしない
    if (!navigator.hid) return;
    // 接続イベント登録
    navigator.hid.addEventListener("connect", webhid.handle_connect);
    // 接続終了イベント登録
    navigator.hid.addEventListener("disconnect", webhid.handle_disconnect);
};

// コマンドを送信
webhid.send_command = function(arr) {
    while (arr.length < webhid.raw_report_id.out_size) arr.push(0x00); // 0詰め
    let cmd = new Uint8Array(arr);
    // console.log("send_command: " + arr.join(","));
    return webhid.device.sendReport(webhid.raw_report_id.out, cmd);
};

// ミリ秒の時間を取得
webhid.millis = function() {
    let d = new Date();
    return d.getTime();
};

// 文字列をuint8Arrayにする
webhid.str2arr = function(str) {
    return new TextEncoder().encode(str);
};

// uint8Arrayを文字列にする
webhid.arr2str = function(arr) {
    return  new TextDecoder().decode(new Uint8Array(arr))
};

// 文字列かどうかの判定
webhid.is_string = function(v) {
    return (typeof v === "string" || v instanceof String);
}

// crc32 計算用のcrcテーブル取得
webhid.get_crctable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

// crc32 ハッシュ計算
webhid.crc32 = function(arr) {
    var crc = 0 ^ (-1);
    for (var i = 0; i < arr.length; i++ ) {
        crc = (crc >>> 8) ^ webhid.crc_table[(crc ^ arr[i]) & 0xFF];
    }
    return Math.floor(crc ^ (-1));
};

// インフォメーション表示
webhid.view_info = function(msg) {
    if (!webhid.info_div) {
        console.log("info: " + msg);
        return;
    }
    $("#" + webhid.info_div).html(msg);
};

// HID接続した時呼び出されるイベント
webhid.handle_connect = function(e) {
    console.log("hid connect");
    webhid.view_info("接続しました " + e.device.productId + " : " + e.device.vendorId);
};

// HID接続終了した時に呼び出されるイベント
webhid.handle_disconnect = function(e) {
    webhid.device = null; // デバイス
    webhid.raw_report_id = 0; // 送受信していたレポート番号
    if (webhid.disconnect_func) webhid.disconnect_func(e);
    console.log("hid disconnect");
    webhid.view_info("切断しました " + e.device.productId + " : " + e.device.vendorId);
};

// データを受け取った時のイベント
webhid.handle_input_report = function(e) {
    // 全てのポートのインプットでこのイベントが発生するのでraw以外のポートのイベントは無視
    if (e.reportId != webhid.raw_report_id.in) return;
    // データをUint8Arrayにする
    let get_data = new Uint8Array(e.data.buffer);
    // console.log("get");
    console.log(get_data);
    let cmd_type = get_data[0];
    let cmd;
    let i, h, p, r, u, s;
    if (cmd_type == webhid.command_id.file_load_start) {
        // ファイル読み込み開始(ファイル有無と容量が帰って来る)
        if (!get_data[1]) { // ファイルが無い
            webhid.load_file_path = ""; // 読み込み終わり
            webhid.view_info("ファイルが存在しませんでした。");
            webhid.get_file_cb_func(2, []);
            return;
        }
        // ファイルの容量取得
        s = (get_data[2] << 24) + (get_data[3] << 16) + (get_data[4] << 8) + get_data[5];
        // 読み込み開始
        webhid.load_start_exec(s, webhid.get_file_cb_func);

    } else if (cmd_type == webhid.command_id.file_load_data) {
        // データロード処理
        webhid.load_data_exec(get_data);
        
    } else if (cmd_type == webhid.command_id.file_save_data) {
        // ファイル保存のデータ要求
        webhid.save_step = get_data[1]; // 送信するステップ数を取得
        s = webhid.save_seek;
        webhid.save_seek = (get_data[2] << 24) + (get_data[3] << 16) + (get_data[4] << 8) + get_data[5]; // 渡すデータの開始位置取得
        p = (get_data[6] << 24) + (get_data[7] << 16) + (get_data[8] << 8) + get_data[9]; // 前回送ったデータのハッシュ(M5Stack側が計算した値)
        h = webhid.crc32(webhid.save_hash);
        // console.log(webhid.save_hash);
        if (h == p) {
            console.log("OK : [" + h + "  " + p + "] [" + webhid.save_seek + " ]");
        } else {
            console.error("NG : [" + h + "  " + p + "] [" + webhid.save_seek + " -> "+s+"]");
            webhid.save_seek = s;
        }
        webhid.save_index = 0; // ステップ位置を0に
        webhid.save_hash = [];
        webhid.last_save_time = webhid.millis(); // 最後にコマンドを投げた時間
        webhid.send_save_data(); // 保存データの送信

    } else if (cmd_type == webhid.command_id.file_save_complate) {
        // ファイル保存完了通知
        p = get_data[1]; // 終了タイプ
        if (p == 0) { // 受け取り完了
            h = (get_data[2] << 24) + (get_data[3] << 16) + (get_data[4] << 8) + get_data[5]; // ファイル全体のハッシュ
            s = webhid.crc32(webhid.save_data);
            if (h == s) {
                // ファイル全体のハッシュも一致していれば保存完了を送信
                console.log("file hash: OK " + h + " " + s);
                cmd = [webhid.command_id.file_save_complate];
                webhid.send_command(cmd).then(() => {
                    webhid.view_info("data check OK!");
                });
            
            } else {
                // ファイル全体のハッシュが合わなければもう一度最初から送り直し
                console.error("file hash: NG " + h + " " + s);
                webhid.save_seek = 0; // 送り位置を最初から
                webhid.save_index = 0; // ステップ位置を0に
                webhid.save_hash = [];
                webhid.last_save_time = webhid.millis(); // 最後にコマンドを投げた時間
                webhid.send_save_data(); // 保存データの送信
            }

        } else if (p == 1) {
            // 保存完了
            webhid.save_data = []; // 保存データクリア
            webhid.save_file_path = ""; // 保存ファイル名クリア
            webhid.view_info("save complate!");
            webhid.save_file_cb_func(0); // 保存完了

        }
    } else if (cmd_type == webhid.command_id.file_remove) {
        // ファイル削除の結果取得
        webhid.file_remove_cb_func(get_data[1]);

    } else if (cmd_type == webhid.command_id.all_remove) {
        // 全ファイル削除の結果取得
        webhid.all_remove_cb_func(get_data[1]);

    } else if (cmd_type == webhid.command_id.file_rename) {
        // ファイル名変更の結果取得
        webhid.file_rename_cb_func(get_data[1]);

    } else if (cmd_type == webhid.command_id.file_list) {
        // ファイルリスト取得開始
        // ファイルリストのサイズ取得
        s = (get_data[1] << 24) + (get_data[2] << 16) + (get_data[3] << 8) + get_data[4];
        // 読み込み開始
        webhid.load_start_exec(s, function(stat, res) {
            if (stat == 0) {
                r =  JSON.parse(webhid.arr2str(res));
                for (i in r.list) {
                    // ファイル名の最初の文字が/から始まってなかったら/を付ける
                    // (arduino 1.8 系でコンパイルしたのには / から始まるが 2.0 以降でコンパイルすると / が入らない)
                    if (r.list[i].name.slice(0, 1) != "/") {
                        r.list[i].name = "/" + r.list[i].name;
                    }
                }
                webhid.file_list_cb_func(stat, r);
            } else {
                webhid.file_list_cb_func(stat, res);
            }
        });
        
    } else if (cmd_type == webhid.command_id.disk_info) {
        // ディスク容量取得
        s = (get_data[1] << 24) + (get_data[2] << 16) + (get_data[3] << 8) + get_data[4]; // ディスク容量
        u = (get_data[5] << 24) + (get_data[6] << 16) + (get_data[7] << 8) + get_data[8]; // 使用容量
        // コールバック実行
        webhid.disk_info_cb_func({"total": s, "used": u});

    } else if (cmd_type == webhid.command_id.get_ap_list) {
        // WIFIのアクセスポイント リスト取得開始
        // リストのサイズ取得
        s = (get_data[1] << 24) + (get_data[2] << 16) + (get_data[3] << 8) + get_data[4];
        // 読み込み開始
        webhid.load_start_exec(s, webhid.get_ap_cb_func);

    } else if (cmd_type == webhid.command_id.read_key) {
        // キーの入力状態取得
        webhid.read_key_cb(get_data);

    } else if (cmd_type == webhid.command_id.get_rotary_key) {
        // I2Cロータリーエンコーダの入力状態取得
        webhid.get_rotary_key_cb(get_data);

    } else if (cmd_type == webhid.command_id.get_pim_key) {
        // I2C PIM447 の入力状態取得
        webhid.get_pim_key_cb(get_data);

    } else if (cmd_type == webhid.command_id.set_pin_set) {
        // 本体の direct, touch, row, col ピン設定をする
        webhid.set_pin_set_cb(0, get_data);

    } else if (cmd_type == webhid.command_id.i2c_read) {
        // i2c からデータ読み込み
        s = get_data[2]; // i2c から読み込んだバイト数
        r = [];
        for (i=3; i<(3+s); i++) r.push(get_data[i]); // 読み込んだデータ作成
        webhid.i2c_read_cb(s, r, get_data);

    } else if (cmd_type == webhid.command_id.i2c_write) {
        // i2c にデータ書込み
        s = get_data[2]; // 読み込みステータス(endTransmission の戻り値) 0 = 成功/1=送信バッファ溢れ/2=アドレス送信時にNACKを受信/3=データ送信時にNACKを受信/4=その他エラー
        webhid.i2c_write_cb(s, get_data);

    } else if (cmd_type == webhid.command_id.get_ioxp_key) {
        // IOエキスパンダからキーの入力データを取得
        // webhid.view_info("key: " + get_data.join(" , "));
        // コールバックを実行
        webhid.get_ioxp_key_cb(get_data);

    } else if (cmd_type == webhid.command_id.set_aztool_mode) {
        // aztool モードのフラグ設定
        // コールバックを実行
        setTimeout(webhid.set_aztool_mode_cb, 100); // 設定が終わった後ちょっと待つ

    } else if (cmd_type == webhid.command_id.get_analog_switch) {
        // アナログスイッチの状態取得
        webhid.get_analog_switch_cb(get_data);

    } else if (cmd_type == webhid.command_id.set_analog_switch) {
        // アナログスイッチの設定変更
        webhid.set_analog_switch_cb(get_data);

    }
    
};

// データロード開始処理
webhid.load_start_exec = function(data_size, cb_func) {
    let i, cmd;
    // ロードするサイズ
    webhid.load_length = data_size;
    // 空のロードデータを作成(ここにデータを入れていく)
    webhid.load_data = [];
    for (i=0; i<webhid.load_length; i++) webhid.load_data.push(0x00);
    // データ取得コマンド作成
    cmd = [webhid.command_id.file_load_data, webhid.load_step, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    // コマンド送信
    webhid.load_cb_func = cb_func;
    webhid.load_index = 0;
    webhid.load_hash = [];
    webhid.last_load_time = webhid.millis(); // 最後にコマンドを投げた時間
    webhid.last_load_point = 0; // 最後にリクエストしたポイント
    webhid.last_send_hash = 0;
    webhid.send_command(cmd).then(() => {
        webhid.view_info("loading... [ 0 / "+webhid.load_length+" ]");
    });
    // ロード監視処理開始
    webhid.file_load_check();
};

// データロード処理
webhid.load_data_exec = function(get_data) {
    let cmd;
    let i, p, s;
    // ファイル読み込み(データ取得)
    i = 0;
    s = get_data.length - 4; // 受け取ったデータのサイズ取得-4はコマンドと開始位置分
    p = (get_data[1] << 16) + (get_data[2] << 8) + get_data[3]; // 受け取ったデータの開始位置取得
    // console.log(p + " / " + webhid.load_length);
    // 1バイトずつデータ取得
    while (i < s) {
        webhid.load_data[p + i] = get_data[i + 4];
        webhid.load_hash.push(get_data[i + 4]);
        i++;
        if ((p + i) >= webhid.load_length) break; // ファイル容量分全部読み込んだら終了
    }
    webhid.load_index++; // step数加算
    if (webhid.load_index >= webhid.load_step && (p + i) < webhid.load_length) {
        // step終わって、まだデータ全部読めて無ければ次のデータ取得コマンドを送信
        webhid.last_send_hash = webhid.crc32(webhid.load_hash);
        webhid.load_index = 0; // stepをリセット
        webhid.load_hash = []; // ハッシュデータもリセット
        m = p + i; // 次読み込む開始位置
        // データ要求コマンド作成
        cmd = [
            webhid.command_id.file_load_data,
            webhid.load_step,
            ((m >> 16) & 0xff), // 読み込み開始位置 1
            ((m >> 8) & 0xff),  // 読み込み開始位置 2
            (m & 0xff),         // 読み込み開始位置 3
            ((webhid.last_send_hash >> 24) & 0xff), // ハッシュ1
            ((webhid.last_send_hash >> 16) & 0xff), // ハッシュ2
            ((webhid.last_send_hash >> 8) & 0xff),  // ハッシュ3
            (webhid.last_send_hash & 0xff) ];       // ハッシュ4
        // コマンド送信
        webhid.last_load_time = webhid.millis(); // 最後にコマンドを投げた時間
        webhid.last_load_point = m; // 最後にリクエストしたポイント
        webhid.send_command(cmd).then(() => {
            webhid.view_info("loading...  "+m+" / "+webhid.load_length+" ");
        });
    } else if ((p + i) >= webhid.load_length) {
        // 最後まで取得できたら完了
        webhid.load_file_path = "";
        // let str = webhid.arr2str(webhid.load_data); // 配列をテキストに変換
        // webhid.view_info("<textarea id='json_area' style='width: 800px; height:300px;'>"+str+"</textarea>");
        webhid.view_info("load complate  "+webhid.load_length+" / "+webhid.load_length+" ");
        // コールバック実行
        webhid.load_cb_func(0, webhid.load_data);
    }
};

// 保存データの送信
webhid.send_save_data = function() {
    let data_len = webhid.raw_report_id.out_size - 5; // 1ステップで送るデータの長さ
    // コマンド作成
    let cmd = [
        webhid.command_id.file_save_data,
        webhid.save_index,
        ((webhid.save_seek >> 16) & 0xff),
        ((webhid.save_seek >> 8) & 0xff),
        (webhid.save_seek & 0xff)
    ];
    // コマンドにデータを格納
    let i = webhid.save_seek + (data_len * webhid.save_index);
    while (cmd.length < webhid.raw_report_id.out_size) {
        if (i >= webhid.save_data.length) {
            cmd.push(0x00);
        } else {
            cmd.push(webhid.save_data[i]);
            webhid.save_hash.push(webhid.save_data[i]);
            i++;
        }
    }
    let p = (webhid.save_seek + (webhid.save_index * (webhid.raw_report_id.out_size - 5)));
    if (p > webhid.save_data.length) p = webhid.save_data.length;
    webhid.view_info("saving ...  " + p + " / " + webhid.save_data.length);
    // コマンド送信
    // console.log("send");
    // console.log(cmd);
    webhid.send_command(cmd).then(() => {
        webhid.save_index++;
        if (webhid.save_index < webhid.save_step) {
            setTimeout(webhid.send_save_data, 0);
        }
    });
};

// ロードが止まって無いか監視
webhid.file_load_check = function() {
    // ロードが完了していたら監視終了
    if (!webhid.load_file_path) return;
    let t = webhid.millis() - webhid.last_load_time; // 最後に送ってからどれくらい時間がたったか
    if (t > 2000) { // 2秒以上データが受け取れなければもう一回データ要求コマンドを送信
        // データ要求コマンド作成
        if (webhid.load_step > 1) webhid.load_step--; // 一度に送るデータ数を減らす
        webhid.load_index = 0; // stepをリセット
        webhid.load_hash = []; // ハッシュデータもリセット
        let cmd = [
            webhid.command_id.file_load_data,
            webhid.load_step,
            ((webhid.last_load_point >> 16) & 0xff),
            ((webhid.last_load_point >> 8) & 0xff),
            (webhid.last_load_point & 0xff),
            0x00, 0x00, 0x00, 0x00 ]; // ハッシュ値0でハッシュチェック関係なく指定したアドレスのデータを要求できる
        // コマンド送信
        webhid.last_load_time = webhid.millis(); // 最後にコマンドを投げた時間
        webhid.send_command(cmd).then(() => {
            webhid.view_info("loading... [ "+webhid.last_load_point+" / "+webhid.load_length+" ]");
        });
    }
    // 1秒おきにチェック
    setTimeout(webhid.file_load_check, 1000);
};

// 保存が止まっていないか監視
webhid.file_save_check = function() {
    // 保存が完了していたら監視終了
    if (!webhid.save_file_path) return;
    let t = webhid.millis() - webhid.last_save_time; // 最後に送ってからどれくらい時間がたったか
    if (t > 2000) { // 2秒以上データが受け取れなければもう一回データ送信
        console.log("save command resend: " + webhid.save_seek);
        webhid.save_index = 0; // ステップ位置を0に
        webhid.save_hash = [];
        webhid.last_save_time = webhid.millis(); // 最後にコマンドを投げた時間
        webhid.send_save_data(); // 保存データの送信
    }
    // 1秒おきにチェック
    setTimeout(webhid.file_save_check, 1000);
}

// HID機器へ接続
webhid.connect = function(cb_func) {
    // デバイスの選択
    navigator.hid.requestDevice(webhid.hid_request_prm).then((devices) => {
        if (!devices.length || !devices[0] || !devices[0].collections) {
            webhid.view_info("機器が見つかりませんでした。");
            cb_func(1);
            return;
        }
        // 接続を開始
        devices[0].open().then(() => {
            // 送受信するレポート番号取得
            let r = webhid.get_report_id(devices[0]);
            if (!r.in || !r.out) {
                webhid.view_info("接続できませんでした。");
                cb_func(2);
                return;
            }
            webhid.raw_report_id = r;
            // 接続完了
            webhid.device = devices[0];
            // データを受け取った時のイベント登録
            webhid.device.addEventListener("inputreport", webhid.handle_input_report);
            cb_func(0);
        });
    });
};

// HID機器切断
webhid.close = function(cb_func) {
    webhid.device.close().then(cb_func);
};

// rawデータを送受信するポートIDを取得する
webhid.get_report_id = function(d) {
    let i;
    let r = {"in": 0, "in_size": 0, "out": 0, "out_size": 0};
    // デバイスの情報が無ければ0
    if (!d.collections || !d.collections.length) return r;
    // 該当のポート番号を探す
    for (i in d.collections) {
        if (d.collections[i].usage == webhid.hid_usage && d.collections[i].usagePage == webhid.hid_usage_page) {
            r.in = d.collections[1].inputReports[0].reportId; // 入力ポートID
            r.in_size = d.collections[1].inputReports[0].items[0].reportCount; // 入力ポートのサイズ(32byte)
            r.out = d.collections[1].outputReports[0].reportId; // 出力ポートID
            r.out_size = d.collections[1].outputReports[0].items[0].reportCount; // 出力ポートのサイズ(32bytp)
            break;
        }
    }
    // 該当するポートを返す(無ければ0)
    return r;
};

// ファイルのデータを取得する
webhid.get_file = function(file_path, cb_func) {
    // コマンドを作成
    webhid.load_file_path = file_path;
    let file_path_arr = webhid.str2arr(file_path);
    let cmd = [webhid.command_id.file_load_start];
    let i;
    if (!cb_func) cb_func = function() {};
    webhid.get_file_cb_func = cb_func;
    for (i=0; i<file_path_arr.length; i++) {
        cmd.push(file_path_arr[i]);
    }
    if (cmd.length > 30) {
        webhid.view_info("ファイル名が長すぎます。 [ "+file_path+" ]");
        webhid.get_file_cb_func(1, []);
        return;
    }
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("loading ...");
    });
};

// ファイルにデータを書き込む
webhid.save_file = function(file_path, file_data, cb_func) {
    // 保存するデータを取得(uint8arrayで保持)
    webhid.save_data = (webhid.is_string(file_data))? webhid.str2arr(file_data): new Uint8Array(file_data);
    webhid.save_hash = [];
    webhid.save_seek = 0;
    webhid.save_file_path = file_path;
    if (!cb_func) cb_func = function() {};
    webhid.save_file_cb_func = cb_func;
    webhid.last_save_time = webhid.millis(); // 最後にコマンドを投げた時間
    let file_path_arr = webhid.str2arr(file_path); // ファイルパスをuint8Arrayに変換
    let data_len = webhid.save_data.length; // 保存するファイルの容量
    // コマンド作成
    let cmd = [
        webhid.command_id.file_save_start,
        ((data_len >> 24) & 0xff),
        ((data_len >> 16) & 0xff),
        ((data_len >> 8) & 0xff),
        (data_len & 0xff),
        4, // 保存データ送信のステップ数指定
    ];
    let i;
    for (i=0; i<file_path_arr.length; i++) {
        cmd.push(file_path_arr[i]);
    }
    if (cmd.length > 30) {
        webhid.view_info("ファイル名が長すぎます。 [ "+file_path+" ]");
        webhid.save_file_cb_func(1);
        return;
    }
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("saving ...");
    });
    // 保存データ送信が止まらないかチェック開始
    webhid.file_save_check();
};

// ファイル削除
webhid.file_remove = function(file_path, cb_func) {
    // コマンドを作成
    webhid.remove_file_path = file_path;
    let file_path_arr = webhid.str2arr(file_path);
    let cmd = [webhid.command_id.file_remove];
    let i;
    if (!cb_func) cb_func = function() {};
    webhid.file_remove_cb_func = cb_func;
    for (i=0; i<file_path_arr.length; i++) {
        cmd.push(file_path_arr[i]);
    }
    if (cmd.length > 30) {
        webhid.view_info("ファイル名が長すぎます。 [ "+file_path+" ]");
        webhid.file_remove_cb_func(1, []);
        return;
    }
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("removeing ...");
    });

};

// 全ファイル削除
webhid.all_remove = function(cb_func) {
    let cmd = [webhid.command_id.all_remove];
    if (!cb_func) cb_func = function() {};
    webhid.all_remove_cb_func = cb_func;
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("removeing ...");
    });
};

// ファイル名変更
webhid.file_rename = function(file_path, rename_path, cb_func) {
    // コマンドを作成
    webhid.remove_file_path = file_path;
    let file_path_arr = webhid.str2arr(file_path);
    let rename_path_arr = webhid.str2arr(rename_path);
    let cmd = [webhid.command_id.file_rename];
    let i;
    if (!cb_func) cb_func = function() {};
    webhid.file_rename_cb_func = cb_func;
    // ファイル名をコマンドに入れる
    for (i=0; i<file_path_arr.length; i++) {
        cmd.push(file_path_arr[i]);
    }
    cmd.push(0x00); // 区切り
    // 変更後ファイル名をコマンドに入れる
    for (i=0; i<rename_path_arr.length; i++) {
        cmd.push(rename_path_arr[i]);
    }
    cmd.push(0x00); // 区切り
    if (cmd.length > 30) {
        webhid.view_info("ファイル名が長すぎます。 [ "+file_path+" , "+rename_path+" ]");
        webhid.file_rename_cb_func(1, []);
        return;
    }
    console.log(cmd);
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("renameing ...");
    });

};

// ファイルリストを取得する
webhid.get_file_list = function(cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.file_list_cb_func = cb_func;
    // ファイルリスト要求コマンド作成
    let cmd = [webhid.command_id.file_list];
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("loading ...");
    });
};

// SPIFFSの容量を取得する
webhid.get_disk_info = function(cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.disk_info_cb_func = cb_func;
    // ディスク容量要求コマンド作成
    let cmd = [webhid.command_id.disk_info];
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("loading ...");
    });
};


// WIFI のアクセスポイントリストを取得する
webhid.get_ap_list = function(cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.get_ap_cb_func = cb_func;
    // ファイルリスト要求コマンド作成
    let cmd = [webhid.command_id.get_ap_list];
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("loading ...");
    });
};

// M5StackCore2 の再起動
webhid.m5_restart = function(boot_type) {
    // ファイルリスト要求コマンド作成
    let cmd = [webhid.command_id.restart, boot_type];
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("restarting ...");
    });

};

// I2Cキー入力取得
webhid.get_ioxp_key = function(ioxp_addr, rows, cb_func) {
    let i;
    if (!rows) rows = [];
    if (!cb_func) cb_func = function() {};
    webhid.get_ioxp_key_cb = cb_func;
    // ファイルリスト要求コマンド作成
    let cmd = [webhid.command_id.get_ioxp_key, ioxp_addr, rows.length];
    for (i=0; i<rows.length; i++) cmd.push(rows[i]);
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("get ioxp key ...");
    });
};

// キーの入力状態取得
webhid.read_key = function(cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.read_key_cb = cb_func;
    // キー入力状態要求コマンド送信
    let cmd = [webhid.command_id.read_key];
    webhid.send_command(cmd).then(() => {
        webhid.view_info("get read key ...");
    });
};

webhid.read_key_parce = function(read_data) {
    let i, j, r;
    let key_len = read_data[1];
    // キー入力を配列にして取得
    let res = [];
    r = 2;
    for (i=0; i<key_len; i++) {
        j = i % 8;
        if (read_data[r] & webhid.read_bit[j]) {
            res.push(1);
        } else {
            res.push(0);
        }
        if (j == 7) r++;
        if (r > 31) break;
    }
    return {"len": key_len, "data": res};
};

// I2Cロータリーエンコーダの入力取得
webhid.get_rotary_key = function(rotary_addr, cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.get_rotary_key_cb = cb_func;
    // I2Cロータリーエンコーダの入力要求コマンド送信
    let cmd = [webhid.command_id.get_rotary_key, rotary_addr];
    webhid.send_command(cmd).then(() => {
        webhid.view_info("get rotary key ...");
    });
};

// I2C PIM447 の入力取得
webhid.get_pim_key = function(pim_addr, cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.get_pim_key_cb = cb_func;
    // I2C PIM447 の入力要求コマンド送信
    let cmd = [webhid.command_id.get_pim_key, pim_addr];
    webhid.send_command(cmd).then(() => {
        webhid.view_info("get pim key ...");
    });
};

// アナログスイッチの状態を取得
webhid.get_analog_switch = function(key_num, cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.get_analog_switch_cb = cb_func;
    let cmd = [webhid.command_id.get_analog_switch, key_num];
    webhid.send_command(cmd).then(() => {
        webhid.view_info("get_analog_switch ...");
    });
};

// アナログスイッチの設定をリアルタイム変更
webhid.set_analog_switch = function(key_num, actuation_type, actuation_point, rapid_trigger, cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.set_analog_switch_cb = cb_func;
    let cmd = [webhid.command_id.set_analog_switch, key_num, actuation_type, actuation_point, rapid_trigger];
    webhid.send_command(cmd).then(() => {
        webhid.view_info("set_analog_switch ...");
    });
}

// 本体の direct, touch, row, col のピン設定をする(変更する)
webhid.set_pin_set = function(pin_setting, cb_func) {
    let i;
    if (!cb_func) cb_func = function(stat, res) {};
    webhid.set_pin_set_cb = cb_func;
    // コマンド作成
    let cmd = [webhid.command_id.set_pin_set];
    // direct ピン
    cmd.push(pin_setting.direct.length);
    for (i in pin_setting.direct) {
        cmd.push(pin_setting.direct[i]);
    }
    // touch ピン
    cmd.push(pin_setting.touch.length);
    for (i in pin_setting.touch) {
        cmd.push(pin_setting.touch[i]);
    }
    // col ピン
    cmd.push(pin_setting.col.length);
    for (i in pin_setting.col) {
        cmd.push(pin_setting.col[i]);
    }
    // row ピン
    cmd.push(pin_setting.row.length);
    for (i in pin_setting.row) {
        cmd.push(pin_setting.row[i]);
    }
    // コマンドのサイズチェック
    if (cmd.length > 32) {
        webhid.set_pin_set_cb(1, null);
        return;
    }
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("set pin set ...");
    });
};

// I2C からデータ読み込み
webhid.i2c_read = function(i2c_addr, read_length, cb_func) {
    if (!cb_func) cb_func = function(read_length, read_data, raw_data) {};
    webhid.i2c_read_cb = cb_func;
    // コマンド送信
    let cmd = [webhid.command_id.i2c_read, i2c_addr, read_length];
    webhid.send_command(cmd).then(() => {
        webhid.view_info("i2c read ...");
    });
};

// I2C にデータ書込み
webhid.i2c_write = function(i2c_addr, write_data, cb_func) {
    if (!cb_func) cb_func = function(stat, raw_data) {};
    webhid.i2c_write_cb = cb_func;
    // コマンド送信
    let cmd = [webhid.command_id.i2c_write, i2c_addr, write_data.length];
    cmd = cmd.concat(write_data); // コマンドの後ろに書込みデータをくっつける
    webhid.send_command(cmd).then(() => {
        webhid.view_info("i2c write ...");
    });
};

// I2C にデータ書込み(複数コマンド)
webhid.i2c_write_list = function(i2c_addr, write_data_list, cb_func) {
    if (!cb_func) cb_func = function(stat, raw_data) {};
    webhid.i2c_write_list_cb = cb_func;
    webhid.i2c_write_list_addr = i2c_addr;
    webhid.i2c_write_list_data = write_data_list;
    webhid.i2c_write_list_func();
};

// I2C に複数データを書き込む（1回分）
webhid.i2c_write_list_func = function() {
    let wdata = webhid.i2c_write_list_data.shift(); // 先頭から1件データ取得
    if (!wdata) return;
    webhid.i2c_write(webhid.i2c_write_list_addr, wdata, function(stat, raw_data) {
        if (stat == 0) {
            // 送信成功
            if (webhid.i2c_write_list_data.length) {
                // まだ送信データがあれば次のデータを送信
                webhid.i2c_write_list_func();
            } else {
                // 全てのデータ送信完了したらコールバック実行
                webhid.i2c_write_list_cb(0);
            }
        } else {
            // 送信失敗したらコールバック実行して終了
            webhid.i2c_write_list_cb(1);
        }
    });
};

// eztoolモードのフラグ設定
webhid.set_aztool_mode = function(set_flag, cb_func) {
    if (!cb_func) cb_func = function() {};
    webhid.set_aztool_mode_cb = cb_func;
    let cmd = [webhid.command_id.set_aztool_mode, set_flag];
    // コマンド送信
    webhid.send_command(cmd).then(() => {
        webhid.view_info("set eztool mode ...");
    });
};
