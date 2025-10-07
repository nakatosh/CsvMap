var aaa  = "";
var bbb  = "";
var db;
var indexedDB = window.indexedDB || window.mozIndexedDB || window.msIndexedDB;
    
    if (indexedDB) {
        // データベースを削除したい場合はコメントを外します。
        //indexedDB.deleteDatabase("mydb");
        var openRequest = indexedDB.open("CSVMAPdb", 1.0);
        openRequest.onupgradeneeded = function(event) {
        // データベースのバージョンに変更があった場合(初めての場合もここを通ります。)
        db = event.target.result;
        var store = db.createObjectStore("mystore", { keyPath: "mykey"});
            store.createIndex("myvalueIndex", "myvalue_1");
            }                
            openRequest.onsuccess = function(event) {
            db = event.target.result;
        }
        } else {
        window.alert("このブラウザではIndexed DataBase API は使えません。");
        }



//全データ表示
function getAll(_event) { 
	return new Promise(function(resolve) {
    //var result = document.getElementById("result");
    result.innerHTML = "";
　bbb  = "";          
    var transaction = db.transaction(["mystore"], "readwrite");
    var store = transaction.objectStore("mystore");
    var request = store.openCursor();
    request.onsuccess = function (event) {

        if(event.target.result == null) {
        //データが無いもしくは終わった
        if (bbb== "") {
      　  result.innerHTML="測定値が入力されたデータはありません";
            } else {       
             result.innerHTML=bbb;
            }
         resolve(bbb)   
        return;
        }
        var cursor = event.target.result;
        var data = cursor.value;
        
        //測定値が入っているものだけ表示
        if(data.mv_5 ===1) {
         bbb += cursor.key +  ","
          + data.mv_1 + "," 
          + data.mv_2 + "," 
          + data.mv_3 + "," 
          + data.mv_4 + "," 
          + data.mv_5 + "," 
          + data.mv_6 + "," 
          + data.mv_7 + "," 
          + data.mv_8 + "," 
          + data.mv_9 + ","
          + data.mv_10 + "\n";
        }
     cursor.continue();
    }
    })
}    

//数える
function getCount() {
var dbq = db.transaction(["mystore"], "readwrite");
var st = dbq.objectStore("mystore");
var rq = st.count();
	rq.onsuccess = function (e) {
	result.innerHTML =  e.target.result ;
	}
}	
		
    //全データ削除 
    function deleteAll() {
        var result = document.getElementById("result");
        result.innerHTML = "";
        var transaction = db.transaction(["mystore"], "readwrite");
        var store = transaction.objectStore("mystore");
        var request = store.clear(); 
        request.onsuccess = function () {
        }
        result.innerHTML = "全データ削除しました。";
    }
	
// CSV出力
async function dCSV(){
await getAll(Event);
await downloadCSV(bbb);
await getCount()
}

// CSV出力
function downloadCSV(bbb) {
	return new Promise(function() {
    //ダウンロードするCSVファイル名を指定する
    var filename = "csvmap.csv";
    //CSVデータ  //0:NO 1:緯度 2:経度 3:メモ 4:FLG 5:rank 6:setubi 7:kazu 8:日時
    var data =  "NO,グループCD,緯度,経度,メモ,完了FLG,項目1,項目2,数量,予備,日時" + "\n" + bbb
    //BOMを付与する（Excelでの文字化け対策）
    var bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    //Blobでデータを作成する
    var blob = new Blob([bom, data], { type: "text/csv" });
    //IE10/11用(download属性が機能しないためmsSaveBlobを使用）
  if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, filename);
        //その他ブラウザ
        } else {
        //BlobからオブジェクトURLを作成する
        var url = (window.URL || window.webkitURL).createObjectURL(blob);
     //ダウンロード用にリンクを作成する
        var download = document.createElement("a");
        //リンク先に上記で生成したURLを指定する
      download.href = url;
        //download属性にファイル名を指定する
        download.download = filename;
        //作成したリンクをクリックしてダウンロードを実行する
      download.click();
        //createObjectURLで作成したオブジェクトURLを開放する
       (window.URL || window.webkitURL).revokeObjectURL(url);
      
    }
    })
} 
//登録  
function setValue(key, GCD, LAT, LNG, memo, FLG, rank, setu, su, yobi, noww) {
  key = parseInt(key, 10);
  LAT = parseFloat(LAT);
  LNG = parseFloat(LNG);
  FLG = parseInt(FLG, 10); // 数値に変換
  GCD= parseInt(GCD,10); // 数値に変換
  // key, LAT, LNG の存在チェック
  if (isNaN(key) || key <= 0 || isNaN(LAT) || isNaN(LNG)) {
    console.warn("key, LAT, LNG のいずれかが無効です。登録を中止します。");
    return;
  }

  var transaction = db.transaction(["mystore"], "readwrite");
  var store = transaction.objectStore("mystore");

  var request = store.put({
    mykey: key,
    mv_1: GCD,
    mv_2: LAT,
    mv_3: LNG,
    mv_4: memo,
    mv_5: FLG,
    mv_6: rank,
    mv_7: setu,
    mv_8: su,
    mv_9: yobi,
    mv_10: noww
  });

  request.onsuccess = function () {
    console.log("保存成功:", key);
  };

  request.onerror = function (event) {
    console.error("保存失敗:", event.target.error);
  };
}

//テキストデータ取込
function txtinp() {
var CR = String.fromCharCode(13);
var LF = String.fromCharCode(10);
var col = document.getElementById("ttt").value;
//var col = result.innerHTML
var cols = col.split(LF);

            var data = [];
            for (var i = 0; i < cols.length; i++) {
    
              var data = cols[i].split(',');  
                         //0:NO 1:緯度 2:経度 3:メモ 4:FLG 5:rank 6:setubi 7:kazu 8:日時
                setValue(data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9]);
            }
result.innerHTML = '入力したデータを取り込みました'; 
}

//csvインポート
// File APIに対応しているか確認
if(window.File && window.FileReader && window.FileList && window.Blob) {
    function loadLocalCsv(e) {
        // ファイル情報を取得
        var fileData = e.target.files[0];
        
        // CSVファイル以外は処理を止める
        if(!fileData.name.match('.csv$')) {
            alert('CSVファイルを選択してください');
            return;
        }

        // FileReaderオブジェクトを使ってファイル読み込み
        var reader = new FileReader();
        // ファイル読み込みに成功したときの処理
        reader.onload = function() {
            var cols = reader.result.split('\n');
            var data = [];
            //ｃｓｖを1行ずつ処理
            for (var i = 0; i < cols.length; i++) {
              var data = cols[i].split(',');//カンマで分割
                     //0:NO 1:緯度 2:経度 3:メモ 4:FLG 5:rank 6:setubi 7:kazu 8:日時
                setValue(data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9]);
            }
	file.value = '';
	result.innerHTML = 'CSVを取り込みました';    	
        var insert = createTable(data);
        result.appendChild(insert);
        }
        // ファイル読み込みを実行
        reader.readAsText(fileData);
	    
    }
    file.addEventListener('change', loadLocalCsv, false);
} else {
    file.style.display = 'none';
    result.innerHTML = 'File APIに対応したブラウザでご確認ください';
}
