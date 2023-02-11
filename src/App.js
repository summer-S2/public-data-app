import React, {useState, useEffect, } from 'react';
import {Map, MapMarker, Status,} from 'react-kakao-maps-sdk';
import './App.css';
 
const { kakao } = window;

function fetchData(page) {
  const promise = fetch(`https://api.odcloud.kr/api/15103788/v1/uddi:76f2c2e9-994a-4d60-9338-e9c7bcf85caa?page=${page}&perPage=20&serviceKey=DKyYe3Av8RY9B8zdwJFttIlmUMMsFSnDAJrKkORKfY%2BD6hGPSLv4lnbsZI2NOayheSc%2B7PpO4P3XIOFUPArSxw%3D%3D`)
    .then(res => {
      if (!res.ok) {
        throw res;
      }
      return res.json();
  })

  return promise;
}

const searchWord = {
  word: '부평맛집'
}


export default function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState(searchWord);



  console.log(data);

  useEffect(() => {
    setIsLoaded(false);

    fetchData(page)
    .then(data => {
      setData(data)
    })
    .catch(error => {
      setError(error)
    })
    .finally(() => setIsLoaded(true))
  }, [page])

  if (error) {
    return <p>failed to fetch</p>
  }

  if (!isLoaded) {
    return <p>fetching data...</p>
  }


  
  function clickBnt(name) {
    const newWord = {word: name};
    setKeyword(newWord);
  
  }

  // ↓↓↓↓ data에서 필요한 자료만 추출  ↓↓↓↓
  const positionsData = data.data.map(position => {
    if (['음식', '카페', '의류'].includes(position['취급품목'])){
      return {
        title: position['상호'],
        category: position['취급품목'],
        // latlng: find(position['주소(부평동)']),
        address: position['주소(부평동)']
      }
    }
  })
  const positions = positionsData.filter(positionsData => positionsData); // undefined 제거
  console.log(positions); // 추출된 자료 확인
  // ↑↑↑↑ data에서 필요한 자료만 추출  ↑↑↑↑

  // ↓↓↓↓ positions의 데이터 화면에 출력  ↓↓↓↓
  const suggest = positions.map(position => (
    <li key={position.title} style={{padding: '10px', textAlign: 'left',}}>
      상호({position.category}): {position.title}  /  주소: {position.address}
    </li>
  ))
  
  return (
    <>
      <div 
        className='mainContainer' 
        style={{
          backgroundColor: 'black', 
          color: 'rgb(168, 168, 168)' , 
          maxWidth: '800px', 
          textAlign: 'center', 
          margin: 'auto', 
          padding: '20px',
        }}>
        <h2 
          style={{
            marginTop: '0', 
            paddingTop: '15px' ,
            color: 'white',
            textAlign: 'left',
          }}>
            상호나 키워드를 입력해 보세요.
        </h2>
        <p style={{textAlign: 'left',}}>
          검색 후 지도 위의 마커를 클릭하시면 상호가 보입니다.<br/>
        </p>

        <div className='container'>
          <div 
            className='kakaoContainer' 
            style={{
              backgroundColor: '#333', 
              padding: '15px',
              borderTopRightRadius: '30px',
              borderTopLeftRadius: '30px',
            }}
          >
            <KakaoMap 
              datas={data.data}
              name={keyword.word}
              clickBnt={clickBnt}
              />
          </div>
          <div 
            className='suggestContainer'
            style={{
              height: '400px',
              
            }}
          >
            <h3 
              style={{
                margin: '0', 
                padding: '10px',
                backgroundColor: '#ccd0d5',
                color: 'black',
              }}>
                문화의거리 추천 검색어
              </h3>
            <div 
              className='buttons'
              style={{height: '40px',}}
              >
              <button 
              onClick={() => {
                if (page === 1) {
                  return
                }
                setPage(page - 1)
              }}
              style={{
                width: '50%',
                height: '100%',
                backgroundColor: '#333',
                padding: '10px',
                color: 'white',
                cursor: 'pointer',
                border: 'none',
                
              }}
              >
                이전추천
              </button>
              <button 
                onClick={() => {
                  if (page===11) {
                    return
                  }
                  setPage(page + 1)}}
                style={{
                  width: '50%',
                  height: '100%',
                  backgroundColor: '#333',
                  padding: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                다음추천
              </button>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0px',
                backgroundColor: '#444',
                margin: '0',
              }}
            >{suggest}</ul>
          </div>
        </div>
      </div>
    </>
  ) 
    

}

function KakaoMap(props) {
  // console.log(props.name)
  const [info, setInfo] = useState()
  const [markers, setMarkers] = useState([])
  const [map, setMap] = useState()
  const [name, setName] = useState('');
  // console.log(name);

  function handleSubmit(e) {
    e.preventDefault();
    props.clickBnt(props.name);
    console.log(e.target);
    // if (!map) return
    const ps = new kakao.maps.services.Places()

    ps.keywordSearch(name, (data, status, _pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        const bounds = new kakao.maps.LatLngBounds()
        let markers = []
        for (var i = 0; i < data.length; i++) {
          // @ts-ignore
          markers.push({
            position: {
              lat: data[i].y,
              lng: data[i].x,
            },
            content: data[i].place_name,
          })
          // @ts-ignore
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x))
        }
        setMarkers(markers)

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds)
      }
    })
    setName("");
  };

//   function handleChange(e) {
//   setName(e.target.value);
// }   


  return (
    <>
      <form 
        onSubmit={handleSubmit} 
        style={{ 
          position: 'relative', 
          width: '100%',
          textAlign: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <input 
          type="text"
          id="search-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={'예: 부평맛집'}
          style={{
            width: '100%',
            height: '30px',
            padding: '10px 20px',
            border: '1px solid gray',
            backgroundColor: '#ccd0d5',
            borderRadius: '20px',

          }}
        />
        <button 
          type="submit"
          disabled={!name.trim()}
          style={{
            height: '30px',
            backgroundColor: 'transparent',
            color: 'white',
            cursor: 'pointer',
            border: 'none',
            position: 'absolute',
            right: '0',
            top: '2.5px',
    
          }}
        >
          <img src="https://img.icons8.com/ios-filled/50/null/search--v1.png" style={{width: '20px'}}/>
        </button>
      </form>
      <Map // 로드뷰를 표시할 Container
        center={{
          lat: 37.49414043756129,
          lng: 126.72427257188353,
        }}
        style={{
          width: "100%",
          height: "300px",
          margin: 'auto',
        }}
        level={3}
        onCreate={setMap}
      >
        {markers.map((marker) => (
          <MapMarker
            key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
            position={marker.position}
            onClick={() => setInfo(marker)}
          >
            {info &&info.content === marker.content && (
              <div style={{color:"gray", fontSize: 'small', }}>{marker.content}</div>
            )}
          </MapMarker>
        ))}
      </Map>
    </>
  )
}
