import axios from 'axios';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import {useNavigate} from "react-router";
import { Baseurl } from '../../services api/baseurl';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/fetaures/authSlice';



export default function Login() {
  const usegatReg = useNavigate()
  const dispatch=useDispatch()
  const navigate = useNavigate();

   const [userlogin,setuserlogin] = useState({
             email: "",
            password:''
   })
  
  

   // handle userlogin data 
   const hadleuserlogin = (e)=>{
     const {name,value} = e.target;
     setuserlogin({...userlogin, [name]:value})
   }




   // handle useloginSubmit 
   const handleSubmit = async (e)=>{
   
      e.preventDefault();
      const userData = {
        email:userlogin.email,
        password:userlogin.password,
      }

      try {
          const resp = await axios.post(`${Baseurl}/api/auth/login`,userData,{
               
          })
             const data  =  resp.data;
             console.log(data.user)
             console.log(data.token)
             
             if (resp.status === 200){
              toast.success(data.message);
              setuserlogin({
                email:'',
                password:''
              })
              dispatch(setCredentials({ user: data.user,token:data.token }));

              navigate('/')
             }



        
      } catch (error) {
        if (error && error.response && error.response.data) {
          toast.error(error.response.data.message)
        }
         console.log(error)
      }

   }




   
   // register btn click in register 

   const handlReister = () =>{
    usegatReg('/register')
   }

  //  const loginHome = ()=>{
  //   Homepage('/Home')
  //  }
   

  return (
    <div>
   <div className="bg-gray-100 font-[sans-serif]">
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="max-w-md w-full">
          

          <div className="p-8 rounded-2xl bg-white shadow">
            <h2 className="text-gray-800 text-center text-2xl font-bold">Login</h2>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="text-gray-800 text-lg mb-2 block">email</label>
                <div className="relative flex items-center">
                  <input id="email" name="email" value={userlogin.email} onChange={hadleuserlogin} type="email" required className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600" placeholder="Enter your email" autoComplete="email" />
                 
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-gray-800 text-lg mb-2 block">Password</label>
                <div className="relative flex items-center">
                  <input id="password" name="password" value={userlogin.password} onChange={hadleuserlogin} type="password" required className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600" placeholder="Enter password" autoComplete="current-password" />
                 
                </div>
              </div>

              <div className="!mt-8">
                <button type="submit" className="w-full py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                  login
                </button>
              </div>
              <p className="text-gray-800 text-sm !mt-8 text-center">Don't have an account? <button type="button" className="text-blue-600 hover:underline ml-1 whitespace-nowrap font-semibold bg-transparent border-none p-0 cursor-pointer" onClick={handlReister}>Register here</button></p>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
