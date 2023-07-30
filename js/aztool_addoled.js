// OLED オプション追加ツール


if (!window.aztool) aztool = {};


// OLED(メイン)オプション追加開始
aztool.addoled_start = function() {
    // 既にOLEDの設定が存在する場合はアラートを出して終了
    if (aztool.addoled_oled_option_exists()) {
        aztool.alert("OLED(メイン) は既に登録されています。", "閉じる", function() {
            aztool.option_add_end(aztool.view_setopt);
        });
        return;
    }
    // HTML 作成
    aztool.addoled_init_html();
    // データの準備
    aztool.step_max = 2;
    aztool.step_index = 0;
    aztool.option_add = {
        "id": "000000", // オプションごとのユニークなID
        "type": 6, // オプションのタイプ 6 = OLED(メイン)
        "enable": 1, // 有効かどうか 1=有効
        "addr": 0x3C, // PIM447のアドレス(デフォルト0x3C)
        "width": 128, // OLED の画面サイズ 幅
        "height": 32, // OLED の画面サイズ 高さ
        "def_img": [], // デフォルトのイメージ画像(表示確認用データ)
        "def_img_save": [] // デフォルトのイメージ画像(保存用データ)
    };
    // 設定画面表示
    aztool.addoled_setiing_view();
};

// PIM447 1U 追加 用HTML作成
aztool.addoled_init_html = function() {
    let html = `
    <div  style="width: 1200px;">
    <table style="width: 100%; height: 700px;"><tr><td valign="top" align="center" style="width: 270px; background-color: #f8f8f8; padding: 20px 0;">
    <table>
    <tr><td align="center"><div id="stepbox_1" class="option_step">設定</div></td></tr>
    <tr><td align="center"><div class="triangle_down"></div></td></tr>
    <tr><td align="center"><div id="stepbox_2" class="option_step">完了</div></td></tr>
    </table>

    </td><td valign="top" style="padding: 20px;">
    <div id="oled_setting_form">
    </div>

    </td></tr></table>

    </div>`;
    $("#" + aztool.addopt_div_id).html(html);
};

// OLED 設定
aztool.addoled_setiing_view = function() {
    let st_th = "width: 100px;text-align: right; padding: 15px 20px;";
    let html = `
    <div style="font-size: 26px; color: black; background-color: #bde4ff; padding: 4px 20px;">OLED (メイン)の設定</div>
    <br>
    <table>
    <tr>
        <td style="`+st_th+`">アドレス</td>
        <td>0x <input type="text" id="oled_addr" value="` + aztool.to_hex(aztool.option_add.addr, 2, "") + `" style="font-size: 26px; width: 80px;"></td>
    </tr>
    <tr>
        <td style="`+st_th+`">サイズ</td>
        <td><select id="oled_size" style="font-size: 26px; width: 260px;">
        <option value="128_32">128 x 32</option>
        <option value="128_64">128 x 64</option>
        <option value="96_16">96 x 16</option>
        </select></td>
    </tr>
    <tr>
        <td style="`+st_th+`">画像</td>
        <td>
        <input id="img_file" type="file" accept="image/*" onChange="javascript:aztool.addoled_image_change();"><br>
        <canvas id="img_canvas" width="0" height="0"></canvas>
        <div id="img_info"></div>
        </td>
    </tr>
    </table>
    <br><br>
    <br><br>
    <div id="addoled_info"></div>
    <div style="text-align: right; width: 800px;">
    <a class='cancel-button' onClick='javascript:aztool.option_add_end(aztool.view_setopt);'>キャンセル</a>
    　<a class="exec-button" onClick="javascript:aztool.addoled_setiing_exec();">保存</a>
    </div>
    `;
    $("#oled_setting_form").html(html);
    $("#oled_size").val(aztool.option_add.width + "_" + aztool.option_add.height);
    aztool.update_step_box(1);
};

// 画像ファイルが選択された
aztool.addoled_image_change = function() {
    aztool.image_change("img_file", {"width": 128, "height": 32}, "img_canvas", function(img_data, save_data) {
        let html = "";
        aztool.option_add.def_img = img_data;
        aztool.option_add.def_img_save = save_data;
        html += "<a class='cancel-button' style='width: 300px;' onClick='javascript:aztool.addoled_image_send_oled();'>OLED に表示して確認する</a>";
        $("#img_info").html(html);
        $("#img_canvas").css({"border": "solid 2px #ddd", "margin": "10px 0"});
    });
};

// 待ち受け画像ファイル変更
// obj = ファイルinput のオブジェクト
// max_size = {"width": 作成する画像の幅, "height": 作成する画像の高さ}
// canvas_id = 作成した画像を表示するキャンバスのID
// cb_func = 画像データ生成後呼び出される関数 func(生成した画像データ配列) ※生成しなかった場合は呼び出されない
aztool.image_change = function(file_id, max_size, canvas_id, cb_func) {
    let set_file = $("#"+file_id)[0].files[0];
    
    // 選択されたファイルが画像かどうか判定する
    // ここでは、jpeg形式とpng形式のみを画像をみなす
    if (set_file.type != "image/jpeg" && set_file.type != "image/png" && set_file.type != "image/bmp") {
      // 画像でない場合は何もせず終了する
      return false;
    }
    // 画像をリサイズする
    let imgobj = new Image();
    let reader = new FileReader();
    reader.onload = function(e) {
      imgobj.onload = function() {

        let max_width = max_size.width;
        let max_height = max_size.height;
        // 縮小後のサイズを計算する
        let width, height;
        let view_x, view_y;
        if((imgobj.width / imgobj.height) > (max_width / max_height)){
          // ヨコ長の画像は横サイズを定数にあわせる
          let ratio = imgobj.height/imgobj.width;
          width = max_width;
          height = max_width * ratio;
          view_x = 0;
          view_y = (max_height - height) / 2;
        } else {
          // タテ長の画像は縦のサイズを定数にあわせる
          let ratio = imgobj.width/imgobj.height;
          width = max_height * ratio;
          height = max_height;
          view_x = (max_width - width) / 2;
          view_y = 0;
        }

        // 縮小画像を描画するcanvasのサイズを上で算出した値に変更する
        let canvas_obj = $("#"+canvas_id)[0];
        canvas_obj.width = max_width;
        canvas_obj.height = max_height;
        
        
        let ctx = canvas_obj.getContext("2d");

        // canvasに既に描画されている画像があればそれを消す
        ctx.rect( 0, 0, max_width, max_height ) ;
        ctx.fillStyle = "#FFFFFF" ;
        ctx.fill() ;

        // canvasに縮小画像を描画する
        ctx.drawImage(imgobj,
          0, 0, imgobj.width, imgobj.height,
          view_x, view_y, width, height
        );
        
        // canvasからrgb565のデータを取得
        imgdata = ctx.getImageData(0, 0, max_width, max_height);
        console.log(imgdata.data.length);
        console.log(imgdata.data);
        let i = 0, j, p = 0, b, c, e, g;
        let gs, cl;
        let img_data = []; // 表示テスト用のデータ
        let save_data = []; // ESP32内に保存する用のデータ
        let data_length = (max_width * max_height) / 8;
        for (i=0; i<data_length; i++) {
            img_data.push(0x00);
            save_data.push(0x00);
        }
        // 画像データ(表示確認用データ、OLEDに送る生データのフォーマット)
        p = 0;
        i = 0;
        while (i < imgdata.data.length) {
            gs = imgdata.data[i] + imgdata.data[i + 1] + imgdata.data[i + 2];
            b = Math.floor(p / max_width / 8); // 8ピクセルラインの何行目か
            c = Math.floor((p % (max_width * 8)) / max_width); // 1ライン縦8ピクセルの何ピクセル目か
            e = p % max_width; // x 座標
            g = (b * max_width) + e;
            if (gs < 384) {
                img_data[g] |= (0x01 << c);
            }
            i += 4;
            p++;
        }
        // 画像データ(ESP32内に保存するデータ、drawBitmapに渡す用のフォーマット)
        p = 0;
        i = 0;
        while (i < imgdata.data.length) {
            gs = imgdata.data[i] + imgdata.data[i + 1] + imgdata.data[i + 2];
            b = Math.floor(p / 8); // 何バイト目か
            c = p % 8; // 何ビット目か
            if (gs < 384) {
                save_data[b] |= (0b10000000 >> c);
            }
            i += 4;
            p++;
        }
        
        // 4 倍のサイズの白黒にしてキャンバスに書く
        canvas_obj.width = max_width * 4;
        canvas_obj.height = max_height * 4;
        ctx = canvas_obj.getContext("2d");
        let x = 0, y = 0;
        for (i=0; i<img_data.length; i++) {
            cl = img_data[i];
            x = i % max_width;
            y = (Math.floor(i / max_width) * 8);
            for (j=0; j<8; j++) {
                if (cl & (0x01 << j)) {
                    ctx.fillStyle = "rgb(40,40,40)" ;
                    ctx.fillRect((x * 4), ((y + j) * 4), 4, 4) ;
                }
            }
        }
        
        // コールバック実行
        cb_func(img_data, save_data);

      }
      imgobj.src = e.target.result;
    }
    reader.readAsDataURL(set_file);
};

// OLED に表示して確認
aztool.addoled_image_send_oled = function() {
    let send_addr = aztool.hex_to_int($("#oled_addr").val());
    let send_size = $("#oled_size").val().split("_");
    let send_width = parseInt(send_size[0]);
    let send_height = parseInt(send_size[1]);
    // OLED 初期化コマンド送信
    webhid.oled_send_init(
        send_addr,
        send_width,
        send_height,
        function(stat) {
            // OLEDに画像データを送る
            webhid.oled_send_img(
                send_addr,
                send_width,
                send_height,
                aztool.option_add.def_img
            );
        }
    );
};

// 設定を保存
aztool.addoled_setiing_exec = function() {
    aztool.option_add.addr = aztool.hex_to_int($("#oled_addr").val());
    let send_size = $("#oled_size").val().split("_");
    aztool.option_add.width = parseInt(send_size[0]);
    aztool.option_add.height = parseInt(send_size[1]);


    // オプション配列が無ければオプション配列作成
    if (!aztool.setting_json_data.i2c_option) aztool.setting_json_data.i2c_option = [];
    // オプションにデータを追加
    let set_data = {
        "id": aztool.random_num(6), // オプションごとのユニークなID
        "type": aztool.option_add_type, // オプションのタイプ 6=OLED(メイン)
        "enable": 1, // 有効かどうか
        "addr": aztool.option_add.addr, // OLED のアドレス
        "width": aztool.option_add.width, // OLED のサイズ 幅
        "height": aztool.option_add.height, // OLED のサイズ 高さ
    };
    // 入力チェック
    if (set_data.addr < 1 || set_data.addr > 255) {
        $("#addoled_info").html("アドレスは01～ffの間で入力して下さい");
        return;
    }
    aztool.setting_json_data.i2c_option.push(set_data);
    // 設定JSON保存
    $("#addoled_info").html("保存中...");
    aztool.update_step_box(2);
    aztool.setting_json_save(function(stat) {
        // 保存失敗
        if (stat != 0) {
            $("#addoled_info").html("保存失敗");
            return;
        }
        $("#addoled_info").html("再起動中...");
        // 画像データがあれば画像も保存
        if (aztool.option_add.def_img_save.length) {
            webhid.save_file(
                "/dmdef",
                aztool.option_add.def_img_save,
                function (stat) {
                    // 保存が終わったら再起動
                    setTimeout(aztool.option_add_restart, 2000);
                }
            );
        } else {
            // 画像が無ければすぐにキーボードを再起動
            setTimeout(aztool.option_add_restart, 2000);
        }
    });
};

// OLED(メイン)の設定が存在するかチェック
aztool.addoled_oled_option_exists = function() {
    let i;
    for (i in aztool.setting_json_data.i2c_option) {
        if (aztool.setting_json_data.i2c_option[i].type == 6) {
            return true;
        }
    }
    return false;
};
