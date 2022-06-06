// キーコード


if (!window.aztool) aztool = {};

// キー選択用カテゴリー(hidの番号)
aztool.key_category = [
    {
        "category": "標準",
        "list": [
            // 削除
            {
                "name": "クリア",
                "list": [0]
            },
            // A - Z
            {
                "name": "英字",
                "list": [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29]
            },
            // 記号
            {
                "name": "記号",
                "list": [45, 46, 53, 47, 48, 49, 50, 51, 52, 54, 55, 56, 100]
            },
            // 0 - 1
            {
                "name": "数字",
                "list": [30,31,32,33,34,35,36,37,38,39]
            },
            // Shift,Ctrl,Alt,GUI
            {
                "name": "Mod",
                "list": [224, 225, 226, 227, 228, 229, 230, 231]
            },
            // 移動キー
            {
                "name": "十字",
                "list": [80, 81, 82, 79, 75, 78, 74, 77]
            },
            // 編集キー
            {
                "name": "編集",
                "list": [8193, 40, 41, 42, 43, 44, 76, 73, 122, 123, 124, 125]
            },
            // Intキー
            {
                "name": "Int",
                "list": [135, 136, 137, 138, 139, 141, 142, 143]
            },
            // Langキー
            {
                "name": "Lang",
                "list": [144, 145, 146, 147, 148, 149, 150, 151, 152]
            },
            // ファンクションキー
            {
                "name": "関数",
                "list": [58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115]
            },
            // テンキー
            {
                "name": "テンキー",
                "list": [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 87, 86, 85, 84, 103, 133, 134, 99, 88, 140]
            },
            // マウス
            {
                "name": "マウス",
                "list": [16385, 16386, 16388, 16389]
            },
            // メディア
            {
                "name": "メディア",
                "list": [8194, 8195, 8196, 8197, 8198, 8199, 8200]
            }
        ]
    }
];



// Eng, Jp, hid, js
aztool.keycode = [
    ['','',0,0],
    ['A','',4,65],
    ['B','',5,66],
    ['C','',6,67],
    ['D','',7,68],
    ['E','',8,69],
    ['F','',9,70],
    ['G','',10,71],
    ['H','',11,72],
    ['I','',12,73],
    ['J','',13,74],
    ['K','',14,75],
    ['L','',15,76],
    ['M','',16,77],
    ['N','',17,78],
    ['O','',18,79],
    ['P','',19,80],
    ['Q','',20,81],
    ['R','',21,82],
    ['S','',22,83],
    ['T','',23,84],
    ['U','',24,85],
    ['V','',25,86],
    ['W','',26,87],
    ['X','',27,88],
    ['Y','',28,89],
    ['Z','',29,90],
    ['1','',30,49],
    ['2','',31,50],
    ['3','',32,51],
    ['4','',33,52],
    ['5','',34,53],
    ['6','',35,54],
    ['7','',36,55],
    ['8','',37,56],
    ['9','',38,57],
    ['0','',39,48],
    ['Enter','',40,13],
    ['Esc','',41,27],
    ['BS','',42,8],
    ['Tab','',43,9],
    ['Space','',44,32],
    ['-','-',45,189],
    ['=','^',46,222],
    ['[','@',47,192],
    [']','[',48,219],
    ['\\','',49,],
    ['NUHS',']',50,221],
    [';',';',51,187],
    ['\'',':',52,186],
    ['`','半角 全角',53,243],
    [',',',',54,188],
    ['.','.',55,190],
    ['/','',56,191],
    ['Caps Lock','',57,20],
    ['F1','',58,112],
    ['F2','',59,113],
    ['F3','',60,114],
    ['F4','',61,115],
    ['F5','',62,116],
    ['F6','',63,117],
    ['F7','',64,118],
    ['F8','',65,119],
    ['F9','',66,120],
    ['F10','',67,121],
    ['F11','',68,122],
    ['F12','',69,123],
    ['Print Screen','',70,44],
    ['Scroll Lock','',71,145],
    ['Pause','',72,19],
    ['Insert','',73,45],
    ['Home','',74,36],
    ['Page Up','',75,33],
    ['Del','',76,46],
    ['End','',77,35],
    ['Page Down','',78,34],
    ['→','',79,39],
    ['←','',80,37],
    ['↓','',81,40],
    ['↑','',82,38],
    ['Num Lock','',83,144],
    ['Num /','',84,111],
    ['Num *','',85,106],
    ['Num -','',86,109],
    ['Num +','',87,107],
    ['Num Enter','',88,13],
    ['Num 1','',89,96],
    ['Num 2','',90,97],
    ['Num 3','',91,98],
    ['Num 4','',92,99],
    ['Num 5','',93,100],
    ['Num 6','',94,101],
    ['Num 7','',95,102],
    ['Num 8','',96,103],
    ['Num 9','',97,104],
    ['Num 0','',98,105],
    ['Num .','',99,110],
    ['NUBS','',100,],
    ['App','',101,93],
    ['Power','',102,255],
    ['Num =','',103,12],
    ['F13','',104,124],
    ['F14','',105,125],
    ['F15','',106,126],
    ['F16','',107,127],
    ['F17','',108,128],
    ['F18','',109,129],
    ['F19','',110,130],
    ['F20','',111,131],
    ['F21','',112,132],
    ['F22','',113,133],
    ['F23','',114,134],
    ['F24','',115,135],
    ['Execute','',116,],
    ['Help','',117,],
    ['Menu','',118,],
    ['Select','',119,],
    ['Stop','',120,],
    ['Again','',121,],
    ['Undo','',122,],
    ['Cut','',123,],
    ['Copy','',124,],
    ['Paste','',125,19],
    ['Find','',126,],
    ['Mute','',127,],
    ['Vol +','',128,],
    ['Vol -','',129,],
    ['Locking Caps Lock','',130,],
    ['Locking Num Lock','',131,],
    ['Locking Scroll Lock','',132,],
    ['Num ,','',133,],
    ['Num = AS400','',134,],
    ['Ro','\\',135,226],
    ['かな','',136,242],
    ['¥','',137,220],
    ['変換','',138,28],
    ['無変換','',139,29],
    ['JIS Numpad ,','',140,],
    ['Int 7','',141,],
    ['Int 8','',142,],
    ['Int 9','',143,],
    ['Lang 1','',144,22],
    ['Lang 2','',145,26],
    ['JIS Katakana','',146,255],
    ['JIS Hiragana','',147,255],
    ['Lang 5','',148,],
    ['Lang 6','',149,],
    ['Lang 7','',150,],
    ['Lang 8','',151,],
    ['Lang 9','',152,],
    ['Alt Erase','',153,],
    ['SysReq','',154,],
    ['Cancel','',155,],
    ['Clear','',156,],
    ['Prior','',157,],
    ['Return','',158,],
    ['Separator','',159,],
    ['Out','',160,],
    ['Oper','',161,],
    ['Clear/Again','',162,],
    ['CrSel/Props','',163,],
    ['ExSel','',164,],
    ['System Power Down','',165,],
    ['Sleep','',166,],
    ['Wake','',167,],
    ['Audio Mute','',168,],
    ['Audio Vol +','',169,],
    ['Audio Vol -','',170,],
    ['Next','',171,],
    ['Previous','',172,],
    ['Media Stop','',173,],
    ['Play','',174,],
    ['Select','',175,],
    ['Eject','',176,],
    ['Mail','',177,],
    ['Calculator','',178,],
    ['My Computer','',179,],
    ['WWW Search','',180,],
    ['WWW Home','',181,],
    ['WWW Back','',182,],
    ['WWW Forward','',183,],
    ['WWW Stop','',184,],
    ['WWW Refresh','',185,],
    ['WWW Favorite','',186,],
    ['Fast Forward','',187,],
    ['Rewind','',188,],
    ['Screen +','',189,],
    ['Screen -','',190,],
    ['Func0','',192,],
    ['Func1','',193,],
    ['Func2','',194,],
    ['Func3','',195,],
    ['Func4','',196,],
    ['Func5','',197,],
    ['Func6','',198,],
    ['Func7','',199,],
    ['Func8','',200,],
    ['Func9','',201,],
    ['Func10','',202,],
    ['Func11','',203,],
    ['Func12','',204,],
    ['Func13','',205,],
    ['Func14','',206,],
    ['Func15','',207,],
    ['Func16','',208,],
    ['Func17','',209,],
    ['Func18','',210,],
    ['Func19','',211,],
    ['Func20','',212,],
    ['Func21','',213,],
    ['Func22','',214,],
    ['Func23','',215,],
    ['Func24','',216,],
    ['Func25','',217,],
    ['Func26','',218,],
    ['Func27','',219,],
    ['Func28','',220,],
    ['Func29','',221,],
    ['Func30','',222,],
    ['Func31','',223,],
    ['Ctrl','',224,17],
    ['Shift','',225,16],
    ['Alt','',226,18],
    ['Win','',227,91],
    ['Ctrl','',228,17],
    ['Shift','',229,16],
    ['Alt','',230,18],
    ['Win','',231,91],
    ['Mouse ↑','',240,],
    ['Mouse ↓','',241,],
    ['Mouse ←','',242,],
    ['Mouse →','',243,],
    ['Mouse Btn1','',244,],
    ['Mouse Btn2','',245,],
    ['Mouse Btn3','',246,],
    ['Mouse Btn4','',247,],
    ['Mouse Btn5','',248,],
    ['Mouse Wh ↑','',249,],
    ['Mouse Wh ↓','',250,],
    ['Mouse Wh ←','',251,],
    ['Mouse Wh →','',252,],
    ['Mouse Acc0','',253,],
    ['Mouse Acc1','',254,],
    ['Mouse Acc2','',255,],
    ['!','',542,],
    ['@','',543,],
    ['#','',544,],
    ['$','',545,],
    ['%','',546,],
    ['^','',547,],
    ['&','',548,],
    ['*','',549,],
    ['(','',550,],
    [')','',551,],
    ['_','',557,],
    ['0','',558,],
    ['{','',559,],
    ['}','',560,],
    ['|','',561,],
    [':','',563,],
    ['"','',564,],
    ['~','',565,],
    ['<','',566,],
    ['>','',567,],
    ['?','',568,],

    ['left Click','',16385,],
    ['Right Click','',16386,],
    ['Middle Click','',16388,],
    ['Scroll','',16389,],
    
    ['Eject','',8193,],
    ['Next','',8194,],
    ['Previous','',8195,],
    ['Stop','',8196,],
    ['Play','',8197,],
    ['Mute','',8198,],
    ['vol+','',8199,],
    ['vol-','',8200,]

];
