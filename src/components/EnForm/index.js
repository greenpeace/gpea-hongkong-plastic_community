import React, { useState, useEffect } from "react";
import cx from "classnames";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSpring, animated } from "react-spring";
import {
  resolveEnPageStatus,
  resolveInitFormValues,
  formatCreditCardNumber
} from "./formHelpers";

import "./index.scss";

import DonateAmountChooser from "./DonateAmountChooser/DonateAmountChooser";
import ExternalLink from "../ExternalLink";
import {
  FORMIK_KEY_TO_EN_KEY,
  RECURRING_PRICES,
  ONETIME_PRICES,
  CURRENCY,
  SUGGESTED_AMOUNT
} from "./config";
//
let initialValues,
  extraInfo = {};
let errors = [];
//
/*
const FormSlogan = () => {
  return (
    <div className="en-form-slogan">
      <div className="main-text">
        您就是帶來改變的力量 Help protect our planet
      </div>
    </div>
  );
};
*/
const mainShare = event => {
  event.preventDefault();
  //
  const fbShare = () => {
    var baseURL = "https://www.facebook.com/sharer/sharer.php";
    var u =
      "https://act.greenpeace.org/page/54795/donate/1?utm_campaign=2020-plastic_community&utm_source=facebook&utm_medium=social&utm_content=thankyou_page";
    var t = (window.innerHeight - 436) / 2;
    var l = (window.innerWidth - 626) / 2;
    window.open(
      baseURL + "?u=" + encodeURIComponent(u),
      "_blank",
      "width=626,height=436,top=" + t + ",left=" + l
    );
  };
  // WEB SHARE API
  if (navigator.share) {
    // we can use web share!
    navigator
      .share({
        title: "",
        text:
          "綠色和平正展開籌款活動： 號召熱心市民捐助支持全城走塑計畫，與我們一起在2020年，與學校合辦走塑學堂、尋找走塑店鋪活動，遊說全港1,000間店鋪加入走塑行列 👉 ",
        url: "https://act.gp/37WRx8v"
      })
      .then(() => console.log("Successfully shared"))
      .catch(error => console.log("Error sharing:", error));
  } else {
    // provide a fallback here
    fbShare();
  }
};

export default props => {
  const stepAnimation = useSpring({
    from: {
      opacity: 0
    },
    opacity: 1
  });
  const [hasRendered, setHasRendered] = useState(false);
  useEffect(() => setHasRendered(true), [hasRendered]);

  // resolve the initial form values
  if (!hasRendered) {
    [initialValues, extraInfo] = resolveInitFormValues();
  }

  // resolve which page should goes to
  // let pageStatus = "SUCC"; // preview of SUCC page
  let pageStatus = resolveEnPageStatus();
  let pageNo;
  if (pageStatus === "SUCC") {
    pageNo = 3;
  } else if (pageStatus === "ERROR") {
    pageNo = 2;
  } else if (extraInfo.useUrlAmount && extraInfo.useUrlIntrvl) {
    pageNo = 2;
  } else {
    pageNo = 1;
  }
  const [stepNo, setStepNo] = useState(pageNo);
  const [donateAmount, setDonateAmount] = useState(
    initialValues["transaction_donationAmt"]
  );
  const [donateIntrvl, setDonateIntrvl] = useState(
    initialValues["recurring_payment_sf"] === "Y" ? "recurring" : "onetime"
  );
  const [disableButton, setDisableButton] = useState(false);
  // receive global events to change amounts
  useEffect(() => {
    window.ee.on("SHOULD_CHOOSE_MONTHLY_AMOUNT", amount => {
      setDonateAmount(amount);
      setDonateIntrvl("recurring");
    });
  }, []);

  if (hasRendered) {
    window.ee.emit("PAGE_STATUS", pageStatus);
  }

  // read in form errors from DOM
  if (!hasRendered) {
    for (let el of document.querySelectorAll(".en__error")) {
      errors.push(el.textContent.trim());
    }
  }
  const [globalErrors, setGlobalErrors] = useState(errors);

  // prepare form validations
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      transaction_donationAmt: Yup.string().required("必填欄位"),
      supporter_firstName: Yup.string().required("必填欄位"),
      supporter_lastName: Yup.string().required("必填欄位"),
      supporter_emailAddress: Yup.string()
        .email("格式錯誤")
        .required("必填欄位"),
      supporter_phoneNumber: Yup.string()
        .matches(/[\d -()]{8,}/, "格式錯誤")
        .required("必填欄位"),
      supporter_dateOfBirth: Yup.string()
        .matches(/\d{4}[/-]\d{1,2}[/-]\d{1,2}/, "格式錯誤")
        .required("必填欄位"),
      transaction_ccnumber: Yup.string()
        .matches(/\d{4} \d{4} \d{4} \d{4}/, "格式錯誤")
        .required("必填欄位"),
      transaction_ccexpire: Yup.string()
        .matches(/\d{2}\/\d{2}/, "格式錯誤 dd/yy")
        .required("必填欄位"),
      transaction_ccvv: Yup.string()
        .matches(/\d{3,4}/, "格式錯誤")
        .required("必填欄位")
    }),
    onSubmit: values => {
      if (Object.keys(formik.errors).length > 0) {
        throw new Error("There are still errors in formik");
      }

      // update all the collect values into legacy form
      for (let formikKey in FORMIK_KEY_TO_EN_KEY) {
        let el = document.querySelector(
          `[name="${FORMIK_KEY_TO_EN_KEY[formikKey]}"]`
        );
        if (el) {
          if (formikKey === "transaction_donationAmt") {
            el.value = donateAmount;
          } else if (formikKey === "recurring_payment_sf") {
            el.value = donateIntrvl === "recurring" ? "Y" : "N";
          } else if (formikKey === "transaction_ccnumber") {
            el.value = formik.values[formikKey].replace(/\s+/g, "");
          } else if (
            formikKey === "send_me_email_hk" ||
            formikKey === "send_me_email_tw"
          ) {
            el.checked = formik.values[formikKey];
          } else {
            el.value = formik.values[formikKey];
          }
        } else {
          throw new Error(
            "Cannot find the input element with name:" +
              FORMIK_KEY_TO_EN_KEY[formikKey]
          );
        }
      }
      // trigger the form submit
      document.querySelector("form.en__component").submit();
    }
  });

  return (
    <>
      {stepNo === 1 && (
        <animated.div style={stepAnimation}>
          <div className="step step-1">
            <DonateAmountChooser
              currency={CURRENCY}
              predefinedAmounts={{
                recurring: RECURRING_PRICES,
                onetime: ONETIME_PRICES
              }}
              amount={donateAmount}
              interval={donateIntrvl}
              suggested_amount={SUGGESTED_AMOUNT}
              onChange={({ interval, amount }) => {
                amount < SUGGESTED_AMOUNT
                  ? setDisableButton(true)
                  : setDisableButton(false);
                setDonateIntrvl(interval);
                setDonateAmount(amount);
              }}
            />
            <button
              className={cx("button", "enform__button")}
              disabled={disableButton}
              onClick={() => {
                setStepNo(2);
              }}
            >
              {props.isMobile ? "下一步 NEXT" : "立即捐助 DONATE NOW"}
            </button>
          </div>
        </animated.div>
      )}

      {stepNo === 2 && (
        <animated.div style={stepAnimation}>
          <div className="step step-2">
            <form onSubmit={formik.handleSubmit}>
              <div className="donate-amount-part">
                <div className="main-text">
                  {donateIntrvl === "recurring" ? "每月捐款" : "單次捐款"}{" "}
                  <br />
                  <span className="donate-amount">
                    {CURRENCY}
                    <span className="amount">
                      {parseInt(donateAmount, 10).toLocaleString()}
                    </span>
                  </span>
                </div>
                <div
                  className="go-back-step1"
                  onClick={() => {
                    setStepNo(1);
                  }}
                >
                  更改金額
                </div>
              </div>

              <div className="form-part">
                <hr />
                <div className="step-explain">
                  <div>捐款人資料 Donor details</div>
                </div>

                {errors.length > 0 && (
                  <div className="global-error help is-danger">
                    <ul>
                      {errors.map((s, idx) => {
                        return <li key={idx}>{s}</li>;
                      })}
                    </ul>
                  </div>
                )}

                <div className="is-flex-horizontal">
                  <div className="field">
                    <label className="label">姓氏 Last name</label>
                    <div className="control">
                      <input
                        id="supporter_lastName"
                        name="supporter_lastName"
                        className={cx("input", {
                          "is-danger":
                            formik.errors["supporter_lastName"] &&
                            formik.touched["supporter_lastName"]
                        })}
                        type="text"
                        placeholder="姓氏 Last name"
                        {...formik.getFieldProps("supporter_lastName")}
                        value={formik.values["supporter_lastName"]}
                      />
                    </div>
                    {formik.errors["supporter_lastName"] &&
                      formik.touched["supporter_lastName"] && (
                        <div className="help is-danger">
                          {formik.errors["supporter_lastName"]}
                        </div>
                      )}
                  </div>

                  <div className="field">
                    <label className="label">名字 First name</label>
                    <div className="control">
                      <input
                        name="supporter_firstName"
                        className={cx("input", {
                          "is-danger":
                            formik.errors["supporter_firstName"] &&
                            formik.touched["supporter_firstName"]
                        })}
                        type="text"
                        placeholder="名字 First name"
                        {...formik.getFieldProps("supporter_firstName")}
                      />
                    </div>
                    {formik.errors["supporter_firstName"] &&
                      formik.touched["supporter_firstName"] && (
                        <div className="help is-danger">
                          {formik.errors["supporter_firstName"]}
                        </div>
                      )}
                  </div>
                </div>

                <div className="field">
                  <label className="label">電郵地址 Email address</label>
                  <div className="control">
                    <input
                      name="supporter_emailAddress"
                      className={cx("input", {
                        "is-danger":
                          formik.errors["supporter_emailAddress"] &&
                          formik.touched["supporter_emailAddress"]
                      })}
                      type="email"
                      placeholder="電郵地址 Email address"
                      {...formik.getFieldProps("supporter_emailAddress")}
                    />
                  </div>
                  {formik.errors["supporter_emailAddress"] &&
                    formik.touched["supporter_emailAddress"] && (
                      <div className="help is-danger">
                        {formik.errors["supporter_emailAddress"]}
                      </div>
                    )}
                </div>

                <div className="field">
                  <label className="label">聯絡電話 Mobile number</label>
                  <div className="control">
                    <input
                      name="supporter_phoneNumber"
                      className={cx("input", {
                        "is-danger":
                          formik.errors["supporter_phoneNumber"] &&
                          formik.touched["supporter_phoneNumber"]
                      })}
                      type="telephone"
                      placeholder="聯絡電話 Mobile number"
                      {...formik.getFieldProps("supporter_phoneNumber")}
                    />
                  </div>
                  {formik.errors["supporter_phoneNumber"] &&
                    formik.touched["supporter_phoneNumber"] && (
                      <div className="help is-danger">
                        {formik.errors["supporter_phoneNumber"]}
                      </div>
                    )}
                </div>

                <div className="field">
                  <label className="label">出生日期 Birthday</label>
                  <div className="control">
                    <input
                      name="supporter_dateOfBirth"
                      className={cx("input", {
                        "is-danger":
                          formik.errors["supporter_dateOfBirth"] &&
                          formik.touched["supporter_dateOfBirth"]
                      })}
                      type="date"
                      placeholder="出生日期 Birthday"
                      {...formik.getFieldProps("supporter_dateOfBirth")}
                    />
                  </div>
                  {formik.errors["supporter_dateOfBirth"] &&
                    formik.touched["supporter_dateOfBirth"] && (
                      <div className="help is-danger">
                        {formik.errors["supporter_dateOfBirth"]}
                      </div>
                    )}
                </div>

                <div className="step-explain">
                  <div>信用卡資料 Credit card details</div>
                </div>

                <div className="field credit-field">
                  <label className="label">信用卡號碼 Credit card number</label>
                  <div className="control">
                    <input
                      name="transaction_ccnumber"
                      className={cx("input", {
                        "is-danger":
                          formik.errors["transaction_ccnumber"] &&
                          formik.touched["transaction_ccnumber"]
                      })}
                      type="text"
                      placeholder="5555 5555 5555 4444"
                      {...formik.getFieldProps("transaction_ccnumber")}
                      onChange={e => {
                        let raw = formatCreditCardNumber(e.target.value);
                        formik.setFieldValue("transaction_ccnumber", raw);
                      }}
                    />
                  </div>
                  {formik.errors["transaction_ccnumber"] &&
                    formik.touched["transaction_ccnumber"] && (
                      <div className="help is-danger">
                        {formik.errors["transaction_ccnumber"]}
                      </div>
                    )}
                </div>

                <div className="is-flex-horizontal">
                  <div className="field">
                    <label className="label">有效期限 Expiry date</label>
                    <div className="control">
                      <input
                        name="transaction_ccexpire"
                        className={cx("input", {
                          "is-danger":
                            formik.errors["transaction_ccexpire"] &&
                            formik.touched["transaction_ccexpire"]
                        })}
                        type="text"
                        placeholder="mm/yy"
                        {...formik.getFieldProps("transaction_ccexpire")}
                        onChange={e => {
                          let raw = e.target.value
                            .replace(/\s+/g, "")
                            .replace(/[^\d]+/g, "")
                            .slice(0, 4);
                          formik.setFieldValue(
                            "transaction_ccexpire",
                            (raw.match(/.{1,2}/g) || []).join("/")
                          );
                        }}
                      />
                    </div>
                    {formik.errors["transaction_ccexpire"] &&
                      formik.touched["transaction_ccexpire"] && (
                        <div className="help is-danger">
                          {formik.errors["transaction_ccexpire"]}
                        </div>
                      )}
                  </div>

                  <div className="field">
                    <label className="label">驗證碼 cvv</label>
                    <div className="control">
                      <input
                        name="transaction_ccvv"
                        className={cx("input", {
                          "is-danger":
                            formik.errors["transaction_ccvv"] &&
                            formik.touched["transaction_ccvv"]
                        })}
                        type="number"
                        placeholder="XXX"
                        {...formik.getFieldProps("transaction_ccvv")}
                        onChange={e => {
                          formik.setFieldValue(
                            "transaction_ccvv",
                            e.target.value.slice(0, 4)
                          );
                        }}
                      />
                    </div>
                    {formik.errors["transaction_ccvv"] &&
                      formik.touched["transaction_ccvv"] && (
                        <div className="help is-danger">
                          {formik.errors["transaction_ccvv"]}
                        </div>
                      )}
                  </div>
                </div>

                <div className="field send-me-email-part">
                  <input
                    type="checkbox"
                    id="send_me_email_hk"
                    {...formik.getFieldProps("send_me_email_hk")}
                    checked={formik.values["send_me_email_hk"]}
                  />
                  <label className="checkbox" htmlFor="send_me_email_hk">
                    我願意收到綠色和平發送的通訊，讓我能掌握環保工作的最新脈動！我同意綠色和平按照個人資料政策與我聯絡，包括提供環保工作資訊及捐款呼籲等。
                    <br />
                    Please send me important updates from Greenpeace.
                  </label>
                </div>
              </div>
              {errors.length > 0 && (
                <div className="global-error help is-danger">
                  <ul>
                    {errors.map((s, idx) => {
                      return <li key={idx}>{s}</li>;
                    })}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                className={cx("button enform__button", {
                  "is-loading": formik.isSubmitting
                })}
              >
                立即捐助
              </button>
            </form>
          </div>
        </animated.div>
      )}

      {stepNo === 3 && (
        <animated.div style={stepAnimation}>
          <div className="step step-3">
            <div className="main-text">
              <p>
                您的{" "}
                <strong>
                  {window.thankyouPageIsRecurring === "Y" ? "每月" : "單次"}{" "}
                  {window.pageJson.currency}
                  {parseInt(window.pageJson.amount, 10).toLocaleString()}
                </strong>{" "}
                捐款已成功處理！我們已發送電子郵件提供進一步資料。 Your{" "}
                <strong>
                  {window.thankyouPageIsRecurring === "Y"
                    ? "Monthly"
                    : "One time"}{" "}
                  {window.pageJson.currency}
                  {parseInt(window.pageJson.amount, 10).toLocaleString()}
                </strong>{" "}
                donation has been processed.
              </p>
              <p>
                我們承諾謹慎善用一分一毫，確保將您的心意，轉化為改變環境的最大力量。群眾力量是促成改變的關鍵，請幫助分享此網頁給您的親友好友，讓我們在第一季得到180位每月支持者，合力共創走塑社區！
              </p>
              <button
                className="button button--share is-fullwidth"
                onClick={mainShare}
              >
                幫忙分享
              </button>
              <p>
                誠邀您加入Whatsapp群組與一眾熱心支持者，交流日常走塑tips、保護環境心得！
              </p>
              <ExternalLink
                href="https://chat.whatsapp.com/3M10Zp2ymdfH0D22DVU7EV"
                alt="加入 Whatsapp 群組"
              >
                <button className="button button--join is-fullwidth">
                  加入 Whatsapp 群組
                </button>
              </ExternalLink>
              <p>
                如果您有任何查詢，請於辦公時間致電會員服務熱線 (852) 2854 8318
                或電郵至
                <ExternalLink
                  href="emailto:donor.services.hk@greenpeace.org"
                  alt="donor.services.hk@greenpeace.org"
                >
                  donor.services.hk@greenpeace.org
                </ExternalLink>
                。
              </p>
              <hr />
              <blockquote>
                與您並肩，為環境「行動，帶來改變」！
                <br />
                "Positive Change through Action" – Together we can make a
                difference!
              </blockquote>
            </div>
          </div>
        </animated.div>
      )}
    </>
  );
};
