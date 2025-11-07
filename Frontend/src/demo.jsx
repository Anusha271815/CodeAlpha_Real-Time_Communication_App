import React from "react";
// import "./demo.css";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { TiTickOutline ,TiTick} from "react-icons/ti";
import Comment from "./comment.jsx";

function Demo({addComments}){
   let [inputValue,setInputValue]=useState({remark :"" , username: "", rating: "5"});

   function handleChange(event){
        setInputValue(prevValue=>{
            return ({...prevValue, [event.target.name]: event.target.value});
        });
   }

   function handleSubmit(event){
        event.preventDefault();
        console.log(inputValue);
        addComments(inputValue);
        setInputValue({remark :"" , username: "", rating: "5"});
   }
    return (
        <>
        <form onSubmit={handleSubmit}>
            <h3>Give your Feedback</h3>
            <label htmlFor="username">Enter Username: </label>
            <input type="text" placeholder="UserName" id="username" value={inputValue.username} onChange={handleChange} name="username"/>
            <br></br>
            <label htmlFor="remark">Remark: </label>
            <textarea type="text" placeholder="remark" id="remark" value={inputValue.remark} onChange={handleChange} name="remark"> </textarea>
            <br></br>
            <label htmlFor="rating">Rating: </label>
            <input type="number" id="rating" value={inputValue.rating} onChange={handleChange} name="rating"/>
            <br></br>
            <button type="submit">Submit</button>
        </form>
        </>
    )

}
export default Demo;