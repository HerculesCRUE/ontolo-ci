import React,{useState,useEffect} from 'react';
import axios from 'axios';
import OCITest from './OCITest';
import Loader from './test/Loader';
import TestCasesHeader from './test/TestCasesHeader';
import {useParams} from "react-router-dom";
import {startTestCasesAnimation,stopTestCasesAnimation} from '../utils/animationUtils';
import {
  BUILD_ENDPOINT,
  REQUEST_METHOD,
  REQUES_HEADER} from '../utils/requestUtils';

export const TestCasesContext = React.createContext();

function OCITestCases() {

  const { id } = useParams();
  const [tests,setTests] = useState([]);
  const [metadata,setMetadata] = useState({});
  const [buildStatus,setStatus] = useState('');

  const getTestCases = function(){
    startTestCasesAnimation();
    axios({
      method: REQUEST_METHOD,
      url:    BUILD_ENDPOINT+'/'+id,
      config: { 
          headers: REQUES_HEADER
      }
  }).then(function(response){
      setMetadata(response.data.metadata)
      setStatus(response.data.status.toLowerCase())
      setTests(response.data.testCaseResults)
      stopTestCasesAnimation();
    })
    .catch(function (response) {
        console.log('Error fetching build with id: '+id)
        console.log(response);
    });
  
  }


  useEffect(() => {
    getTestCases()
  }, []);


  return (
    <TestCasesContext.Provider
            value={{
              buildStatus:buildStatus,
              owner:metadata.owner,
              repo:metadata.repo,
              commit:metadata.commit,
              commitId:metadata.commitId,
              commitName:metadata.commitName,
              prNumber:metadata.prNumber,
              branch:metadata.branch,
              execution_time:metadata.execution_time,
              execution_date:metadata.execution_date,
            }}>
       
        <Loader/>
    
        <div className="main">
          <TestCasesHeader/>
          <h2><a className="subtitle">{"Test Cases ("+tests.length+")"}</a></h2>
          <div className="test-elements-list">
            {
            tests.map( (test,id) =>{
              console.log(test)
              return <OCITest 
                      key = {id}
                      testName= {test.testCase.name}
                      status ={test.status.toLowerCase()}
                      expectedSM_in={test.testCase.expectedShapeMap}
                      producedSM_in={test.testCase.producedShapeMap}
                      expectedSM_out={test.metadata.expected}
                      producedSM_out={test.metadata.produced}
                      executionTime={test.metadata.execution_time}/>
            })}                         
            </div>
        </div>
  </TestCasesContext.Provider>
  );
}

export default OCITestCases;
