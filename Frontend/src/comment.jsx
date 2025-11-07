import { useState } from "react";
import Demo from "./demo.jsx";
function Comment({}){
    let[arr,setArr]=useState([]);
    // setArr(prevArr=>[...prevArr,formDetails]);

    function addComments(comment){
        setArr(prevArr=>[...prevArr,comment]);
        console.log(" Added Comment ")
    }
    return(
        <div>
            <h3>All Comments</h3>
            {arr.map((item,index)=>(
                <div key={index}>
                    <h4>{item.username}</h4>
                    <p>{item.remark}</p>
                    <p>{item.rating}</p>
                </div>
            ))}
            <Demo addComments={addComments}/>
        </div>

    )
}
export default Comment;