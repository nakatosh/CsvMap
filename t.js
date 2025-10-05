

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
            store.createIndex("myvalueIndex", "myvalue");
            }                
            openRequest.onsuccess = function(event) {
            db = event.target.result;
        }
        } else {
        window.alert("このブラウザではIndexed DataBase API は使えません。");
        }

//マーカークリックイベント
function markerClick(e){ 
  ck();
  //マーカーから値をもらう
  NO.value = e.sourceTarget.options.customID;            
  LAT.value = e.latlng.lat;
  LNG.value = e.latlng.lng;
  ima();
  map.setView([e.latlng.lat, e.latlng.lng]);

  //現在地取得
  GPS(); 
  //完了FLG クリア 
 // kflg.value = "";
  //接地抵抗に移動
  document.getElementById('kflg').focus()
  //DBから値をもらう
  getValue(); 

}

// 接地抵抗が入力済みなら取得する
 function getValue() {
  var key = document.getElementById("NO").value;
  //var result = document.getElementById("result");             
  var transaction = db.transaction(["mystore"], "readwrite");
  var store = transaction.objectStore("mystore");                  
  var request = store.get(key);

  request.onsuccess = function (event) {  

    if (event.target.result === undefined) {} else {
      //値あり

    var result = event.target.result;
    GCD.value   = result.mv_1;
    biko.value  = result.mv_4;
    kflg.value  = result.mv_5;
    rank.value  = result.mv_6;
    setub.value = result.mv_7;
    suryo.value = result.mv_8;
    noww.value  = result.mv_10;
    }
  }
}


function setValue10() {
  document.getElementById("suryo").value = 0;
}
function setValue20() {
  document.getElementById("suryo").value =document.getElementById("suryo").value +++ 5;
}
function setValue30() {
  document.getElementById("suryo").value =document.getElementById("suryo").value +++ 10;
}


//登録  
function setValue() {
  const g = id => document.getElementById(id), key = g("NO").value;
  if (key <= 0) return alert('マーカーをクリックしてから登録してください!!');
  const data = {
    mykey: key, 
    mv_1: g("GCD").value,
    mv_2: +g("LAT").value, 
    mv_3: +g("LNG").value,
    mv_4: g("biko").value, 
    mv_5: 1,
    mv_6: g("rank").value,  
    mv_7: +g("setub").value, 
    mv_8: +g("suryo").value,
    mv_9: 0,
    mv_10: g("noww").value
  };
 //db登録
  db.transaction(["mystore"], "readwrite").objectStore("mystore").put(data).onsuccess = () =>
    console.log("保存成功:", key);
 //入力欄リセット
  ["NO","GCD", "kflg", "biko", "rank", "setub", "suryo"].forEach(id => g(id).value = "");
//再マーク
  MAKall(); 
  ck0();

  // 保存成功時の処理（必要なら追加）
  request.onsuccess = function () {
    console.log("データの保存に成功しました:", key);
  };
}


//キャンセル
function notValue() {
   const g = id => document.getElementById(id), key = g("NO").value;
  if (key <= 0) return alert('マーカーをクリックしてから登録してください!!');
  const data = {
    mykey: key, 
    mv_1: g("GCD").value,
    mv_2: +g("LAT").value, 
    mv_3: +g("LNG").value,
    mv_4: g("biko").value, 
    mv_5: +g("kflg").value,
    mv_6: g("rank").value,  
    mv_7: +g("setub").value, 
    mv_8: +g("suryo").value,
    mv_9: 0,
    mv_10: g("noww").value

  };
 //db登録
  db.transaction(["mystore"], "readwrite").objectStore("mystore").put(data).onsuccess = () =>
    console.log("保存成功:", key);
 //入力欄リセット
  ["NO","GCD", "kflg", "biko", "rank", "setub", "suryo"].forEach(id => g(id).value = "");
//再マーク
  MAKall(); 
  ck0();

  // 保存成功時の処理（必要なら追加）
  request.onsuccess = function () {
    console.log("データの保存に成功しました:", key);
  };
}
// LDBからマーカ
function MAKall() {
  return new Promise(function(resolve) {
    var transaction = db.transaction(["mystore"], "readwrite");
    var store = transaction.objectStore("mystore");
    var request = store.openCursor();

    MI.clearLayers();
    KAN.clearLayers();
    ho.clearLayers();
    moji.clearLayers();

    request.onsuccess = function (event) {
      if(event.target.result == null) {
        resolve();
        return;
      }

      var cursor = event.target.result;
      var data = cursor.value;

  var divIcon3 = L.divIcon({
    html: String(data.mykey).slice(-4),
  className: 'divicon2',
  iconSize: [0,0],
  iconAnchor: [-15,15]
});

//検索BOXに値が入っていてかつ一致したら書く

    switch (data.mv_5) {
      case 1:
        addMarkerToLayer(KAN, data, '#fb1bceff', divIcon3);
        break;
      case 0:
        addMarkerToLayer(MI, data, '#30242fff', divIcon3);
        break;
      case 3:
        addMarkerToLayer(ho, data, '#047104ff', divIcon3);
        break;
      case 4:
        addMarkerToLayer(ho, data, '#14a9ceff', divIcon3);
        break;
      default:
        addMarkerToLayer(MI, data,'#30242fff', divIcon3);
    }
          cursor.continue();
        };
      });
}

// レイヤーにマーカーを追加する関数
function addMarkerToLayer(layer, data, color, divIcon3) {
//検索BOXに値が入っていてかつ一致したら書く
var kno =document.getElementById("PullDownList").value 
  if(kno > 0){
    if(data.mv_1 == kno){
          layer.addLayer(
            L.circleMarker([data.mv_2, data.mv_3],
              {color: '#fdfdfd', weight: 0,  fillColor: color, fillOpacity: 1, radius: 8, customID: data.mykey})
              .on('click', function(e) { markerClick(e); })
          );
          moji.addLayer(
            L.marker([data.mv_2, data.mv_3], {icon: divIcon3})
          );
	} else {}

} else {
          layer.addLayer(
            L.circleMarker([data.mv_2, data.mv_3],
              {color: '#fdfdfd', weight: 0,  fillColor: color, fillOpacity: 1, radius: 8, customID: data.mykey})
              .on('click', function(e) { markerClick(e); })
          );
          moji.addLayer(
            L.marker([data.mv_2, data.mv_3], {icon: divIcon3})
          );
  
}
}
// LDBから線を引く
function addline() {
return new Promise(function(resolve) {              
  var transaction = db.transaction(["mystore"], "readwrite");
  var store = transaction.objectStore("mystore");
  var request = store.openCursor();
  //lineレイヤー削除
  line.clearLayers();
  request.onsuccess = function (event) {
    //リストがなかったら終了  
    if(event.target.result == null) {
    resolve()   
    return;
     }
    var cursor = event.target.result;
    var data = cursor.value;

    if(data.mv_1>0){
   line.addLayer(
       L.polyline([[data.mv_2, data.mv_3]], {color: 'red'})
    );

    } else {

    }
    cursor.continue();
  }
})
}


//マーカーが全部入るイメージ
function zenb(){
map.fitBounds(MI.getBounds());   
};



function ck(){
let element = document.getElementById('pop-up');
element.checked = true;
}
function ck0(){
let element = document.getElementById('pop-up');
element.checked = false;
}

//現在地
function GPS() {
	function success(pos) {
		GLAT.value = pos.coords.latitude;
		GLNG.value = pos.coords.longitude;

	}
  function error() {
		alert('位置情報を取得できませんでした。');
		GLAT.value = 0;
		GLNG.value = 0;
	}
	var options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};
	  if (watch_id == 0) {
		watch_id = navigator.geolocation.watchPosition(success, error, options); // 現在地情報を定期的に
  	}
}

//現在地
function currentWatch() {
	function success(pos) {
		var lat = pos.coords.latitude;
		var lng = pos.coords.longitude;
		map.setView([ lat,lng ]);
		// 現在地に表示するマーカー
		if (curMarker) {
			map.removeLayer(curMarker);
		}
		curMarker = L.marker([lat, lng],{icon:myIcon3}).addTo(map);
	}
	function error(err) {
		alert('位置情報を取得できませんでした。');
	}
	var options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};
	if (watch_id == 0) {
		watch_id = navigator.geolocation.watchPosition(success, error, options); // 現在地情報を定期的に
	}
}

function currentWatchReset() {
	if (watch_id > 0) {
		navigator.geolocation.clearWatch(watch_id);
		watch_id = 0;
	}
	if (curMarker) {
		map.removeLayer(curMarker);
		curMarker = null;
	}
}


//待つタイプ
async function mikan(){
  await MAKall();
  await map.fitBounds(MI.getBounds());   
};
async function kanryo(){
    await MAKall();
    await map.fitBounds(KAN.getBounds());   
};
	
//現在時刻
function ima() {
  const D = new Date();
  const year = D.getFullYear();
  const month = D.getMonth() + 1;
  const date = D.getDate();
  const hour = D.getHours();
  const minute = D.getMinutes();
  const second = D.getSeconds();
  noww.value =  year + "/" + month + "/" + date + " " + hour + ":" + minute + ":" + second;
}

//グーグルマップを開く
function gmap() {
  if (document.getElementById("NO").value>0){} else {alert('マーカーを選択してから押すと、グーグルマップで現在地からの経路が表示されます。');return;}
  var glat = document.getElementById("LAT").value;
    var glng = document.getElementById("LNG").value;
  
  window.open("https://www.google.com/maps?q=" + glat + "," + glng);
  }

//管理NOリストBOXに格納　重複あり

function KANRINOa() {
  return new Promise(function(resolve) {
    var result = document.getElementById("result");                   
    var transaction = db.transaction(["mystore"], "readwrite");
    var store = transaction.objectStore("mystore");
    var request = store.openCursor();
    let array =[];
  
    request.onsuccess = function (event) {
      if(event.target.result == null) {
      resolve()
	//重複削除
	let res = new Set(array)  
		res.forEach((element)=>{
    
    	// option要素を生成
    	let option = document.createElement('option');
    
    	option.text = element;
   	 option.value = element;
    
   	 // 生成したoption要素をselect要素に追加
  	  document.getElementById("PullDownList").add(option);
		document.getElementById("PullDownList").value = "";
	});
      return;
    }
      var cursor = event.target.result;
      var data = cursor.value;
	array.unshift( data.mv_1);
	  cursor.continue();
    }
  })
}
//フィーダを選択
function inputChange(){
MAKall();

}