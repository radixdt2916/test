import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoanServices from "../services/LoanServices";

export default function Login() {
  const navigate = useNavigate();
  const userInfo = {
    name: "",
    email: "",
    password: "",
    errorMsg: {
      name: "",
      email: "",
      password: "",
    },
  };
  const [userDetail, setUserDetail] = useState(userInfo);
  const [message, setMessage] = useState({ status: false, msg: "" });
  const [confirmBox, setConfirmBox] = useState(false);
  const [formStatus, setFormStatus] = useState(false);

  const handleChange = (e) => {
    e.preventDefault();
    const name = e.target.name;
    const value = e.target.value;
    const errors = userDetail.errorMsg;
    var validEmail = ["gmail.com", "yahoo.com"];
    var password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
    switch (name) {
      case "name":
        setUserDetail({...userDetail,name:value})
        if(value.length > 3 && value.length < 40){
          errors.name = ""
        }else{
          errors.name = "username length should be required minimum 3 and maximum 20"
        }
        break
      case "email":
        setUserDetail({ ...userDetail, email: value });
        const emailValue = value.split("@")[1];
        if (validEmail.includes(emailValue)) {
          errors.email = "";
        } else {
          errors.email = "Please verify email address";
        }
        break;
      case "password":
        setUserDetail({ ...userDetail, password: value });
        if (value.match(password)) {
          errors.password = "";
        } else {
          errors.password =
            "Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters";
        }
        break;
      default:
        break;
    }
  };

  const verifyDetails = (userdata) => {
    const error = {};
    const keys = Object.keys(userdata.errorMsg);
    let verify = true;
    for (const value of keys) {
      if (userdata[value] === "") {
        verify = false;
        error[value] = "Required field";
      }
      if (userdata.errorMsg[value] !== "") {
        verify = false;
        error[value] = userdata.errorMsg[value]
        setMessage({ status: false, msg: "please resolve your active error" });
        setConfirmBox(true);
        setTimeout(() => setConfirmBox(false),5000);
      }
    }
    setUserDetail({ ...userDetail, errorMsg: error });
    return verify;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formStatus === false){
      const loginUser = {
        email:userDetail.email,
        password:userDetail.password,
        errorMsg:userDetail.errorMsg
      }
      if (verifyDetails(loginUser)) {
        LoanServices.LoginUser(loginUser)
          .then((res) => {
            if (res.data.success) {
              navigate("/emicalculator");
              // localStorage.setItem("token", res.data.token);
              document.cookie=`token=${res.data.token}`
            } else {
              setMessage({ status: false, msg: res.data.msg });
              setConfirmBox(true);
              setTimeout(() => setConfirmBox(false), 5000);
            }
          })
          .catch((ex) => navigate("/"));
      }
    }else{
      if (verifyDetails(userDetail)) {
        LoanServices.CreateUser(userDetail)
          .then((res) => {
            if (res.data.success) {
              setFormStatus(false)
              setUserDetail({...userDetail,email:res.data.msg.email,password:res.data.msg.password})
            } else {
              setMessage({ status: false, msg: res.data.msg });
              setFormStatus(true)
              setConfirmBox(true);
              setTimeout(() => setConfirmBox(false), 5000);
            }
          })
          .catch((ex) => navigate("/"));
      }
    }
    
  };
  return (
    <div className="container w-100 d-flex justify-content-center">
      <div className="border border-dark py-3 my-5 w-50">
        <div className="text-center text-primary fs-3 my-2">{formStatus === false ? "Login user" : "Create a account"}</div>
        {confirmBox && (
          <div
            className={
              message.status
                ? "alert alert-success mx-4"
                : "alert alert-danger mx-4"
            }
            role="alert"
          >
            {message.msg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mx-auto w-75">
          {formStatus === true && (
            <div className="mb-3">
              <label htmlFor="exampleInputname1">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={userDetail.name}
                // onChange={(e) =>
                //   setUserDetail({ ...userDetail, email: e.target.value })
                // }
                onChange={handleChange}
                id="exampleInputname1"
                required
              />
              {userDetail && userDetail.errorMsg?.name !== "" && (
                <small className="text-danger my-2">
                  {userDetail.errorMsg.name}
                </small>
              )}
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="exampleInputEmail1">Email address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={userDetail.email}
              // onChange={(e) =>
              //   setUserDetail({ ...userDetail, email: e.target.value })
              // }
              onChange={handleChange}
              id="exampleInputEmail1"
              required
            />
            {userDetail && userDetail.errorMsg?.email !== "" && (
              <small className="text-danger my-2">
                {userDetail.errorMsg.email}
              </small>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="exampleInputPassword1">Password</label>
            <input
              type="password"
              className="form-control"
              value={userDetail.password}
              name="password"
              // onChange={(e) =>
              //   setUserDetail({ ...userDetail, password: e.target.value })
              // }
              onChange={handleChange}
              id="exampleInputPassword1"
              required
            />
            {userDetail && userDetail.errorMsg?.password !== "" && (
              <small className="text-danger my-2">
                {userDetail.errorMsg.password}
              </small>
            )}
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
          <div className="text-end text-primary" onClick={() => setFormStatus(!formStatus)}>
             {formStatus === false ? "Create Account" : "Login Here"}</div>
        </form>
      </div>
    </div>
  );
}
