// M5StackCore2 端末の待ち受け画像設定


if (!window.aztool) aztool = {};



aztool.view_setdispimg = function() {
    // HTML 作成
    aztool.dispimg_init_html();
    // データの準備
    aztool.step_max = 2;
    aztool.step_index = 0;
    aztool.option_add = {
        "img_data": [] // イメージ画像(保存用データ)
    };
    // 設定画面表示
    aztool.dispimg_setiing_view();

};

// 待ち受け画像のファイル名 取得
aztool.dispimg_file_path_get = function() {
    if (aztool.get_disp_rotation() == 0) return "/stimg.bin";
    return "/stimg_w.bin";
};

// 待ち受け画像設定 用HTML作成
aztool.dispimg_init_html = function() {
    let html = `
    <div  style="width: 1200px;">
    <table style="width: 100%; height: 700px;"><tr><td valign="top" align="center" style="width: 270px; background-color: #f8f8f8; padding: 20px 0;">
    <table>
    <tr><td align="center"><div id="stepbox_1" class="option_step">設定</div></td></tr>
    <tr><td align="center"><div class="triangle_down"></div></td></tr>
    <tr><td align="center"><div id="stepbox_2" class="option_step">完了</div></td></tr>
    </table>

    </td><td valign="top" style="padding: 20px;">
    <div id="dispimg_setting_form">
    </div>

    </td></tr></table>

    </div>`;
    $("#main_box").html(html);
};

// 待ち受け画像 設定 画面表示
aztool.dispimg_setiing_view = function() {
    let st_th = "width: 100px;text-align: right; padding: 15px 20px;";
    let html = `
    <div style="font-size: 26px; color: black; background-color: #bde4ff; padding: 4px 20px;">待ち受け画像の設定</div>
    <br>
    <table cellspacing="30">
    <tr>
        <td style="`+st_th+`">サイズ</td>
        <td><font id="disp_size" style="font-size: 40px;">-</font></td>
    </tr>
    <tr>
        <td style="`+st_th+`">画像</td>
        <td>
        <input id="img_file" type="file" accept="image/*" onChange="javascript:aztool.dispimg_image_change();"><br>
        <br><br>
        <canvas id="img_canvas" width="0" height="0"></canvas>
        <div id="img_info"></div>
        <div id="img_load_btn">
            <a class='cancel-button' style="width: 400px;" onClick='javascript:aztool.dispimg_load_img();'>現在の画像を表示</a>
        </div>
        </td>
    </tr>
    </table>
    <br><br>
    <br><br>
    <div id="dispimg_info" style="text-align: right; width: 800px;"></div>
    <div id="dispimg_btn_box" style="text-align: right; width: 800px;">
    <a class='cancel-button' onClick='javascript:aztool.view_top_menu();'>キャンセル</a>
    　<a class="exec-button" onClick="javascript:aztool.dispimg_image_save();">保存して再起動</a>
    </div>
    `;
    $("#dispimg_setting_form").html(html);
    if (aztool.get_disp_rotation() == 0) {
        $("#disp_size").html("240 × 320");
    } else {
        $("#disp_size").html("320 × 240");
    }
    $(".exec-button").hide();
    aztool.update_step_box(1);
};

// 現在の画像を読み込んで表示する
aztool.dispimg_load_img = function() {
    // 現在の画像読み込み
    $("#img_load_btn").hide();
    $("#dispimg_btn_box").hide();
    webhid.info_div = "img_info";
    webhid.get_file(aztool.dispimg_file_path_get(), function(stat, img_data) {
        console.log("dispimg_load_img: " + stat);
        webhid.info_div = null;
        $("#img_info").html("");
        $("#dispimg_btn_box").show();
        if (stat == 2) { // ファイルが無い
            $("#img_info").html("デフォルト画像です");
            return;
        } else if (stat > 0) { // それ以外の読み込みエラー
            $("#img_info").html("画像の読み込みに失敗しました");
            return;
        }
        // 画像表示
        let max_width = 320, max_height = 240;
        if (aztool.get_disp_rotation() == 0) { max_width = 240, max_height = 320; }
        aztool.dispimg_canvas_view("img_canvas", max_width, max_height, img_data);
        aztool.option_add.img_data = img_data;
    });
};

// 画像ファイルが選択された
aztool.dispimg_image_change = function() {
    let w, h;
    if (aztool.get_disp_rotation() == 0) {
        w = 240; h = 320;
    } else {
        w = 320; h = 240;
    }
    aztool.dispimg_image_change_data("img_file", {"width": w, "height": h}, "img_canvas", function(img_data) {
        let html = "";
        aztool.option_add.img_data = img_data;
        // html += "<a class='cancel-button' style='width: 300px;' onClick='javascript:aztool.addoled_image_send_oled();'>モニタに表示して確認する</a>";
        // $("#img_info").html(html);
        $("#img_canvas").css({"border": "solid 2px #ddd", "margin": "10px 0"});
        $(".exec-button").show();
        $("#img_load_btn").hide();
        $("#img_info").html("");
    });

};

// 待ち受け画像ファイル変更
// obj = ファイルinput のオブジェクト
// max_size = {"width": 作成する画像の幅, "height": 作成する画像の高さ}
// canvas_id = 作成した画像を表示するキャンバスのID
// cb_func = 画像データ生成後呼び出される関数 func(生成した画像データ配列) ※生成しなかった場合は呼び出されない
aztool.dispimg_image_change_data = function(file_id, max_size, canvas_id, cb_func) {
    let set_file = $("#"+file_id)[0].files[0];
    
    // 選択されたファイルが画像かどうか判定する
    // ここでは、jpeg形式とpng形式のみを画像をみなす
    if (set_file.type != "image/jpeg" && set_file.type != "image/png" && set_file.type != "image/bmp") {
      // 画像でない場合は何もせず終了する
      return false;
    }
    // 画像をリサイズする
    var imgobj = new Image();
    var reader = new FileReader();
    reader.onload = function(e) {
      imgobj.onload = function() {

        var max_width = max_size.width;
        var max_height = max_size.height;
        // 縮小後のサイズを計算する
        var width, height;
        var view_x, view_y;
        if((imgobj.width / imgobj.height) > (max_width / max_height)){
          // ヨコ長の画像は横サイズを定数にあわせる
          var ratio = imgobj.height/imgobj.width;
          width = max_width;
          height = max_width * ratio;
          view_x = 0;
          view_y = (max_height - height) / 2;
        } else {
          // タテ長の画像は縦のサイズを定数にあわせる
          var ratio = imgobj.width/imgobj.height;
          width = max_height * ratio;
          height = max_height;
          view_x = (max_width - width) / 2;
          view_y = 0;
        }

        // 縮小画像を描画するcanvasのサイズを上で算出した値に変更する
        var cvobj = $("#"+canvas_id)[0];
        cvobj.width = max_width;
        cvobj.height = max_height;
        
        
        var ctx = cvobj.getContext("2d");

        // canvasに既に描画されている画像があればそれを消す
        ctx.rect( 0, 0, max_width, max_height ) ;
        ctx.fillStyle = "#000000" ;
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
        var i = 0;
        var cr, cg, cb, ch, cl;
        var img_data = [];
        // ヘッダデータ(lvglの.binファイル用)
        img_data.push(0x04);
        img_data.push(((max_width & 0x3f) << 2));
        img_data.push(((max_height & 0x07) << 5) | ((max_width & 0x07c0) >> 6));
        img_data.push(((max_height & 0x07f8) >> 3));
        // 画像データ
        while (i < imgdata.data.length) {
            cr = imgdata.data[i] >> 3;
            cg = imgdata.data[i + 1] >> 2;
            cb = imgdata.data[i + 2] >> 3;
            ch = cr << 3 | cg >> 3;
            cl = (cg & 0x07) << 5 | cb;
            img_data.push(cl);
            img_data.push(ch);
            i += 4;
        }
        // フッタデータ
        img_data.push(0x0A);
        
        // RGB565のデータでキャンバスに画像を描く(色が多少変わるため)
        aztool.dispimg_canvas_view(canvas_id, max_width, max_height, img_data);
        
        // コールバック実行
        cb_func(img_data);

      }
      imgobj.src = e.target.result;
    }
    reader.readAsDataURL(set_file);
};


aztool.dispimg_canvas_view = function(canvas_id, max_width, max_height, img_data) {
    // 縮小画像を描画するcanvasのサイズを上で算出した値に変更する
    let cvobj = $("#"+canvas_id)[0];
    cvobj.width = max_width;
    cvobj.height = max_height;
    
    let ctx = cvobj.getContext("2d");

    // canvasに既に描画されている画像があればそれを消す
    ctx.rect( 0, 0, max_width, max_height ) ;
    ctx.fillStyle = "#000000" ;
    ctx.fill() ;

    // RGB565のデータでキャンバスに画像を描く(色が多少変わるため)
    let i = 4;
    let x = 0, y = 0;
    let cl, ch, cr, cg, cb;
    while (i < (img_data.length - 1)) {
        cl = img_data[i];
        ch = img_data[i + 1];
        cr = ch & 0xF8;
        cg = ((ch & 0x07) << 3 | (cl >> 5)) << 2;
        cb = (cl & 0x1F) << 3;
        ctx.fillStyle = "rgb("+cr+","+cg+","+cb+")" ;
        ctx.fillRect(x, y, 1, 1) ;
        x++;
        if (x >= max_width) { x = 0; y++; }
        i += 2;
    }

};

// 変更した画像を保存する
aztool.dispimg_image_save = function() {
    // 画面準備
    $("#dispimg_btn_box").hide();
    webhid.info_div = "dispimg_info";
    // 保存するファイルパスを取得
    let file_path = aztool.dispimg_file_path_get();
    // 待ち受け画像保存
    webhid.save_file(file_path, aztool.option_add.img_data, function(stat) {
        webhid.info_div = null;
        // 保存しっぱいしたら画面にメッセージを出す
        if (stat > 0) {
            $("#dispimg_info").html("保存できませんでした。「"+file_path+"」");
            $("#dispimg_btn_box").show();
            return;
        }
        // 保存成功したので再起動
        $("#dispimg_info").html("保存完了。再起動します。");
        aztool.update_step_box(2);
        webhid.m5_restart(0);
    });
};