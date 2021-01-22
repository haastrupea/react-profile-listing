// import logo from './logo.svg';
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import {
  faCaretSquareDown,
} from "@fortawesome/free-regular-svg-icons";
import { faCaretDown, faCaretUp, faExclamation, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import "./App.css";
import "./App.scss";

library.add(fab)

function App() {


  const [data, setData] = useState(null);

  const [pagedata, setPageData] = useState(null);

  const [errorMsg, setErrorMsg] = useState(false);

  const [search,setSearch] = useState('')
  const [page, setPage] = useState(null);
  const [maxPage, setmaxPage] = useState(null);
  
  const [found, setFound] = useState(null);



  const [f_genderFields,setf_genderFields] = useState([]);
  const [f_payMethodFields,setf_payMethodFields] = useState([]);

  const [genderFilter,setGenderFilter] = useState(null)
  const [payMethodFilter,setPayMethodFilter] = useState(null)
  
  const limit = 20;

  useEffect(()=>{
    document.title = 'Patient Profile'
    const url = 'https://api.enye.tech/v1/challenge/records';

    fetch(url)
    .then(res=>res.json())
    .then(data=>{
      if(data.status==='success'){

        console.log(data);
        const v = data.records
        setData(v.profiles)



        //gender and payment methods
        const Gender = []
        const PaymentMethod = []
        v.profiles.forEach(element => {
          const g = element.Gender.toLowerCase()
          const p = element.PaymentMethod.toLowerCase()
          if(!Gender.includes(g)){
            Gender.push(g)
          }
          if(!PaymentMethod.includes(p)){
            PaymentMethod.push(p)
          }
        });
        
        setf_genderFields(Gender)
        setf_payMethodFields(PaymentMethod)
      }
      
    })
    .catch(err=>{
      console.log(err.message,'error')
      setErrorMsg(err.message)
    })

    window.addEventListener('hashchange',(e)=>{
      const p = getPage();
          setPage(p)
    },false)
  },[])

  
 



  const getPage = () =>{
    const hash = window.location.hash;
    const hashNum = hash? Number(hash.replace('#','')):1;

    return hashNum;
  }

  const getMaxPage = (data) =>{
    const max = Math.ceil(data.length/limit);
    return max;
  }

  useEffect(()=>{

    const searchForPatient = (input)=>{
      input = input.toLowerCase()
    const d = data.filter((v)=>{
          const Fname = v.FirstName.toLowerCase()
          const Lname = v.LastName.toLowerCase()
          const Uname = v.UserName.toLowerCase()
        if(Fname.startsWith(input) || Lname.startsWith(input) || Uname.startsWith(input)){
          return true
        }else if(input.length===0){
          return true
        }
        return false
    })

    return d
  }

    const filteredData = (data)=>{
      const filtered = data.filter((v)=>{
        const gender = v.Gender.toLowerCase()
        const payMethod = v.PaymentMethod.toLowerCase()
        if(genderFilter && payMethodFilter){
          return (genderFilter === gender && payMethodFilter === payMethod)
        }else if(genderFilter){
          return (genderFilter === gender)
        }else if(payMethodFilter){
          return payMethodFilter === payMethod
        }
        
          return true
        
      })
      
      return filtered
    }

    if(data){
      const s = searchForPatient(search)
      const fil = filteredData(s);
          setFound(fil.length)
    const maxPag = getMaxPage(fil)
      setmaxPage(maxPag) 

    const p = getPage()
    const pM = p<1?1:p;
    const pD = pM>maxPag?maxPag:pM;
        setPage(pD)
   
    const d_data = renderPerPage(pD,fil);
        setPageData(d_data)
    }
  },[data,genderFilter,payMethodFilter,page,search])

 

  const renderPerPage = (p,data) =>{
    window.location.hash = `#${p}`;
    const endIndex = p * limit;
      const startIndex = endIndex - limit;
      const d= data.filter((v,i)=>{
     
       if(i>=startIndex && i<endIndex){

         return true
       }else{
         return false
       } 
       
      })
      return d
  }

  // const resetFilter = () =>{
  //   setGenderFilter(null)
  //   setPayMethodFilter(null)
  // }
  const handleSearch = (e) =>{

    setSearch(e.target.value)
  }
  return (
    <div className="App">

      {data && <div className='filters__wrapper'>
          <div className='filters__search'>
            <input onChange={handleSearch} className='filters__search-text' placeholder='search with Firstname, Lastname or Username' type='search' />
          </div>
        <div className='filters'>
        <Filter selected={genderFilter} setSelected={setGenderFilter} label='Gender' opt={f_genderFields} />
        <Filter selected={payMethodFilter} setSelected={setPayMethodFilter} label='Payment Method' opt={f_payMethodFields} />
        </div>
        {/* <button onClick={resetFilter} className='filters__reset'><FontAwesomeIcon icon={faRecycle} /> <span>Reset</span></button> */}
       {found && <div style={{textAlign:'center',color:'white'}}> <span style={{fontWeight:'bold'}}>{found}</span> profile(s) found</div>}
      </div>}

      {maxPage>1 && <Pagination activeId={page} maxPage={maxPage} />}
      {pagedata ? <Profiles data={pagedata} />: <div style={{minHeight:'100vh',display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>{errorMsg?<><FontAwesomeIcon color='rgb(255, 67, 67)' size='3x' icon={faExclamation} /><span style={{color:'rgb(255, 67, 67)'}} >{errorMsg}</span></>:<><FontAwesomeIcon color='rgb(65, 183, 226)' size='3x' className='fa fa-spin' icon={faTimes} /><span style={{color:'rgb(65, 183, 226)'}} >Loading...</span></>}</div>}
        {maxPage>1 && <Pagination activeId={page}  maxPage={maxPage} />}
    </div>
  );
}

export default App;


const Profiles = ({data}) =>{
  const [activeProfile, setActiveProfile] = useState(null);

  return (
    <div className="profiles">
        <div className="profile profile__header">
        <div className="profile__table">
        <div className="profile__table-row profile__table-head">
          <span className="profile__table-data">Username</span>
          <span className="profile__table-data">Gender</span>
          <span className="profile__table-data">payment Method</span>
          <span className="profile__carret" style={{opacity:0}}>
            <FontAwesomeIcon
              icon={faCaretSquareDown}
            />
          </span>
        </div>

      </div>
        </div>
        { data &&
          data.map((profileData, i) => {
          return (
            <Profile
              setexpandedProfile={setActiveProfile}
              expandedProfile={activeProfile}
              id={i}
              key={i}
              data={profileData}
            />
          );
        }) 
        }

        {data.length===0 && 
        <div style={{display:"flex",justifyContent:'center',alignItems:'center',flexDirection:'column',marginTop:'20px',color:'rgba(192, 230, 244, 1)'}}>
          <FontAwesomeIcon size='3x' icon={faSearch} />
          <h4>No Profile Found</h4>
          </div>}

        
      </div>
  )
}


const PageItem =({pageId,activeId}) => (
    <a href={`#${pageId}`}><div className={`pagination__page ${activeId===pageId?'pagination__page--active':''}`}>{pageId} </div></a>
    );


const Pagination =({maxPage,activeId}) =>{
 
  //prev
  const handlePrev = () =>{
    window.location.hash = `#${activeId-1}`;
  }

  //next
  const handleNext = () =>{
    window.location.hash = `#${activeId+1}`;
  }



  const generatePageItem = () => {
    const item = []
    for(let i=1;i<=maxPage;i++){
      item.push(i)
    }
    return item
  }

  return(
    <div className='pagination'>
          <div className='pagination__page' onClick={handlePrev}>Prev</div>
          { generatePageItem().map((v,key)=>{
            return <PageItem key={key} pageId={v} activeId={activeId} />
          })
          }
          <div className='pagination__page' onClick={handleNext}>Next</div>
        </div>
  )
}

const Filter = ({label,opt,selected,setSelected}) =>{
  const handleSelect = (e) =>{
    let v = e.target.value;
     setSelected(v)
   }
   return (
     <div className='filter'>
       <label className='filter__label'>{label}</label>
       <div className="filter__input">
       <select defaultValue={selected} className='filter__select' onChange={handleSelect}>
           <option value="" >{label}</option>
           {opt.map((v,key)=>{
             return <option key={key} value={v}>{v}</option>
           })}
         </select>
         <FontAwesomeIcon color='black' icon={faCaretDown} />
       </div>

     </div>
   )
 }



const Profile = ({ setexpandedProfile, expandedProfile, id, data }) => {
  const [collapsed, setCollapsed] = useState(true);
  const {
    FirstName,
    LastName,
    Gender,
    Latitude,
    Longitude,
    CreditCardNumber,
    CreditCardType,
    Email,
    DomainName,
    PhoneNumber,
    MacAddress,
    URL,
    UserName,
    LastLogin,
    PaymentMethod
  } = data
  const toogleCollapsed = () => {
    setexpandedProfile(id);
    setCollapsed((prevState) => !prevState);
  };

  useEffect(() => {
    if (expandedProfile !== id) {
      setCollapsed(true);
    }
  }, [expandedProfile, id]);

  return (
    <div className="profile">
      <div className="profile__table" onClick={toogleCollapsed}>
        <div className="profile__table-row">
          <span className="profile__table-data">{UserName}</span>
          <span className="profile__table-data">{Gender}</span>
          <span className="profile__table-data">{PaymentMethod}</span>
          <span className="profile__carret">
            <FontAwesomeIcon
              color={collapsed ? "inherit" : "white"}
              icon={collapsed ? faCaretDown : faCaretUp}
            />
          </span>
        </div>
      </div>
      <div
        className={`profile-data ${collapsed ? "profile-data--collapsed" : ""}`}
      >
        <div className="profile-data__section">
          <h4 className="profile-data__label">BIO</h4>
          <div className="profile-data__details">
            <span className="profile-data__key">FullName:</span>{" "}
            <span className="profile-data__value">{`${LastName} ${FirstName}`}</span>
          </div>
        </div>
        <div className="profile-data__section">
          <h4 className="profile-data__label">CONTACT</h4>
          <div className="profile-data__details">
            <span className="profile-data__key">Mobile-Phone:</span>{" "}
            <span className="profile-data__value">{PhoneNumber}</span>
          </div>
          <div className="profile-data__details">
            <span className="profile-data__key">E-mail:</span>{" "}
            <span className="profile-data__value">{Email}</span>
          </div>
          <div className="profile-data__details">
            <span className="profile-data__key">Website:</span>{" "}
            <span className="profile-data__value"><a href={`http://${DomainName}`} target='_blank' rel="noreferrer">{DomainName}</a></span>
          </div>
        </div>
        <div className="profile-data__section">
          <h4 className="profile-data__label">FINANCIAL</h4>
          <div className="profile-data__details">
            <span className="profile-data__key">Credit-Card:</span>{" "}
            <span className="profile-data__value">{CreditCardNumber}</span>
            <FontAwesomeIcon title={CreditCardType}
              className="profile-data__cc-icon"
              icon={['fab',`cc-${CreditCardType.toLowerCase().includes('american')?'amex':CreditCardType.toLowerCase().replace(' ','-')}`]}
            />
          </div>
          
        </div>
        <div className="profile-data__section profile-data__section--tracking">
          <h4 className="profile-data__label profile-data__label--tracking">TRACKING INFO</h4>
          <div className="profile-data__details profile-data__details--tracking">
            <span className="profile-data__key">Last login:</span>{" "}
            <span className="profile-data__value">
              {LastLogin}
            </span>
          </div>
          <div className="profile-data__details profile-data__details--tracking">
            <span className="profile-data__key">MAC-Address:</span>{" "}
            <span className="profile-data__value">{MacAddress}</span>
          </div>
          <div className="profile-data__details profile-data__details--tracking">
            <span className="profile-data__key">URL:</span>{" "}
            <span className="profile-data__value"><a href={`http://${URL}`} target='_blank' rel="noreferrer">{URL}</a></span>
          </div>
          <div className="profile-data__details profile-data__details--tracking">
            <span className="profile-data__key">Location(coordinate):</span>{" "}
            <span className="profile-data__value">{Latitude},{Longitude}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
