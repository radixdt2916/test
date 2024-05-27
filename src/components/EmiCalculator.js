import React, { useEffect, useMemo, useState } from "react";
import LoanServices from "../services/LoanServices";
import jwt_deode from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function EmiCalculator() {
  const emicalculator = {
    amount: "",
    rate: "",
    months: "",
    errors: {
      amount: "",
      rate: "",
      months: "",
    },
  };

  const finalEmi = {
    emi: "",
    interest: "",
    payment: "",
  };
  const [loanEmi, setLoanEmi] = useState(emicalculator);
  // const [emicalculatorError,setCalculateEmiError] = useState(emicalculator)
  const [calculateEmi, setCalculateEmi] = useState(finalEmi);
  const [confirmation, setConfirmation] = useState(false);
  const [userEmiHistory, setUserEmiHistory] = useState([]);
  const [message, setMessage] = useState({ status: false, msg: "" });
  const [confirmBox, setConfirmBox] = useState(false);
  const token = document.cookie.split("=")[1];
  const userId = jwt_deode(token);
  const navigate = useNavigate();


  useEffect(() => {
   if(token){
    LoanServices.getEmiDetails(userId.user._id, token)
    .then((res) => {
      if (res.data.success) {
        setUserEmiHistory(res.data.msg.emiHistory);
      }
    })
    .catch((ex) => {
      navigate("/");
    });
   }else{
    navigate("/");
   }
  // eslint-disable-next-line
  },[])

  const finalEmiCount = (ruppes, interest, months) => {
    const amount = ruppes;
    const rate = interest / 1200;
    const month = months;
    const monthEmi =
      Math.round(
        ((amount * rate) / (1 - Math.pow(1 / (1 + rate), month))) * 100
      ) / 100;
    const totalPayment = Math.round(monthEmi * month * 100) / 100;
    const totalInterest =
      Math.round((totalPayment * 1 - amount * 1) * 100) / 100;
    setCalculateEmi({
      ...calculateEmi,
      emi: Math.round(monthEmi),
      interest: Math.round(totalInterest),
      payment: Math.round(totalPayment),
    });
    setConfirmation(true);
  };

  const handleChange = (e) => {
    e.preventDefault();
    const name = e.target.name;
    const value = e.target.value;
    const errors = loanEmi.errors;
    switch (name) {
      case "amount":
        setLoanEmi({ ...loanEmi, amount: parseInt(value) });
        if (parseInt(value) >= 10000 && parseInt(value) <= 20000000) {
          errors.amount = "";
        } else {
          errors.amount = "loan start amount 10000 to 2 crore";
        }
        break;
      case "rate":
        setLoanEmi({ ...loanEmi, rate: parseInt(value) });
        if (parseInt(value) >= 5 && parseInt(value) <= 20) {
          errors.rate = "";
        } else {
          errors.rate = "loan interest minimum 5% and maximum 20%";
        }
        break;
      case "months":
        setLoanEmi({ ...loanEmi, months: parseInt(value) });
        if (parseInt(value) >= 3 && parseInt(value) <= 120) {
          errors.months = "";
        } else {
          errors.months = "loan period minimum 3 and maximum 120 months";
        }
        break;
      default:
        break;
    }
  };

  const userEmiList = useMemo(() => {
    return (
      <>
        {userEmiHistory && userEmiHistory.length > 0 && (
          <div>
            <h2>All Emi History</h2>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Interest</th>
                  <th scope="col">Months</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {userEmiHistory.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.amount}</td>
                      <td>{item.rate}%</td>
                      <td>{item.months}</td>
                      <td>
                        <button
                          onClick={() => {
                            setLoanEmi({
                              ...loanEmi,
                              amount: item.amount,
                              rate: item.rate,
                              months: item.months,
                            });
                            finalEmiCount(item.amount, item.rate, item.months);
                          }}
                        >
                          Check EMI
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  // eslint-disable-next-line
  }, [userEmiHistory]);

  // eslint-disable-next-line  
  useEffect(() => {
    if (token) {
      LoanServices.getEmiDetails(userId.user._id, token)
        .then((res) => {
          if (res.data.success) {
            setUserEmiHistory(res.data.msg.emiHistory);
          }
        })
        .catch((ex) => navigate("/"));
    } else {
      navigate("/");
    }
  // eslint-disable-next-line
  }, [confirmation]);

  const formValidation = (emiData) => {
    const error = {};
    const keys = Object.keys(emiData.errors);
    let verify = true;
    for (const value of keys) {
      if (emiData[value] === "") {
        verify = false;
        error[value] = "Required field";
      }
      if (emiData.errors[value].length > 0) {
        verify = false;
        error[value] = emiData.errors[value];
      }
    }
    setLoanEmi({ ...loanEmi, errors: error });
    if (userEmiHistory?.length > 0) {
      userEmiHistory.forEach((item) => {
        if (
          item.amount === loanEmi.amount &&
          item.rate === loanEmi.rate &&
          item.months === loanEmi.months
        ) {
          verify = false;
        }
      });
    }
    return verify;
  };

  const handleEmiCalculator = (e) => {
    e.preventDefault();
    if (formValidation(loanEmi)) {
      finalEmiCount(loanEmi.amount, loanEmi.rate, loanEmi.months);
      LoanServices.AddEmiDetails(userId.user._id, loanEmi, token)
        .then((res) => {
          if (res.data.success) {
            setUserEmiHistory(res.data.msg.emiHistory);
          }
        })
        .catch((ex) => navigate("/"));
    } else {
      setConfirmBox(true);
      setMessage({ status: false, msg: "please resolve your active error" });
      setTimeout(() => setConfirmBox(false),5000);
    }
  };

  return (
    <div className="container my-5 ">
      <div className="row">
        <div className="col-md-6">
          <h2 className="text-centar text-primary">Loan Emi Calculator</h2>
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
          <form>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1">
                Loan Amount <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={loanEmi.amount}
                name="amount"
                // onChange={(e) =>
                //   {
                //     setLoanEmi({ ...loanEmi, amount: parseInt(e.target.value) })
                //   }
                // }
                onChange={handleChange}
                id="exampleInputEmail1"
                required
              />
              {loanEmi && loanEmi.errors?.amount !== "" && (
                <small className="text-danger my-2">
                  {loanEmi.errors.amount}
                </small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1">
                Interest <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={loanEmi.rate}
                name="rate"
                // onChange={(e) =>
                //   setLoanEmi({ ...loanEmi, rate: parseFloat(e.target.value) })
                // }
                onChange={handleChange}
                id="exampleInputPassword1"
                required
              />
              {loanEmi && loanEmi.errors?.rate !== "" && (
                <small className="text-danger my-2">
                  {loanEmi.errors.rate}
                </small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1">
                Loan Tenure (In Months) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="months"
                value={loanEmi.months}
                // onChange={(e) =>
                //   setLoanEmi({ ...loanEmi, months: parseInt(e.target.value) })
                // }
                onChange={handleChange}
                id="exampleInputPassword1"
              />
              {loanEmi && loanEmi.errors?.months !== "" && (
                <small className="text-danger my-2">
                  {loanEmi.errors.months}
                </small>
              )}
            </div>
            <div className="text-center">
              <button
                type="submit"
                onClick={handleEmiCalculator}
                className="btn btn-primary me-2"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmation(false);
                  setLoanEmi({
                    ...loanEmi,
                    amount: "",
                    rate: "",
                    months: "",
                    errors: {
                      amount: "",
                      rate: "",
                      months: "",
                    },
                  });
                }}
                className="btn btn-secondary"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-6 py-5 ps-4">
          {confirmation && (
            <div className="w-100 my-5 border border-dark bg-gray">
              <h2>
                <span className="text-info pe-3">Monthly Loan EMI :</span>
                {calculateEmi.emi}
              </h2>
              <h2>
                <span className="text-info pe-3">Total Interest Payable :</span>
                {calculateEmi.interest}
              </h2>
              <h2>
                <span className="text-info pe-3">Total Payment :</span>
                {calculateEmi.payment}
              </h2>
            </div>
          )}
        </div>
      </div>
      <div>{userEmiList}</div>
    </div>
  );
}
