import React from "react";
import "./index.scss";
//
import grade1 from "../../assets/images/GP_PlasticFreeStickers_grade1.png";
import grade2 from "../../assets/images/GP_PlasticFreeStickers_grade2.png";
import pic1 from "../../assets/images/GP0STREPE_Medium_res.jpg";
import pic2 from "./../../assets/images/GP0STTWGQ_Medium_res.jpg";
//
export default props => {
  return (
    <section className="section section-intro">
      <div className="section-header has-text-centered">
        <p className="title">全城走塑貼紙</p>
        <p>
          經我們成功遊說的店鋪，會貼上全城走塑貼紙，方便大家識別一級和二級走塑店鋪！
        </p>
      </div>
      <div className="row">
        <div className="col-xs-12">
          <div className="sticker-wrapper">
            <div className="sticker">
              <div className="sticker__name">一級走塑店鋪</div>
              <figure className="image">
                <img className="is-rounded" src={grade1} alt="一級走塑店鋪" />
              </figure>
              <ul>
                <li>－ 完全淘汰即棄塑膠 或</li>
                <li>－ 提供走塑優惠</li>
              </ul>
            </div>
            <div className="sticker">
              <div className="sticker__name">二級走塑店鋪</div>
              <figure className="image">
                <img className="is-rounded" src={grade2} alt="二級走塑店鋪" />
              </figure>
              <ul>
                <li>－ 不主動提供即棄塑膠 或</li>
                <li>－ 歡迎自備餐具 / 器皿購物</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="row text-right">
        <div className="col-xs-12 col-md-6">
          <div className="column__img">
            <img src={pic1} alt="pic1" />
          </div>
        </div>
        <div className="col-xs-12 col-md-6">
          <p className="title">我們的目標</p>
          <p>
            我們期望在第一季招募60位的每月支持者，長期支持走塑計畫，我們將善用您的一分一毫，與義工團隊到達大埔區，遊說50間店鋪加入走塑，並與學校、區議員合力擴大走塑社區板圖。您的點滴支持，是支持我們全年長期工作的力量，讓我們合力達成2020年目標，共創走塑社區！
          </p>
        </div>
      </div>
      <div className="row text-left">
        <div className="col-xs-12 col-md-6">
          <p className="title">全城走塑項目成果</p>
          <p>
            自2018年起，我們與家庭、學校、義工團隊，甚至藝人唐寧親身到社區，遊說店鋪走塑。在大家努力下，目前全港已有600間店鋪加入，沙田亦成為了第一個走塑模範社區。2020年，我們希望更多店鋪貼起「全城走塑」貼紙，讓消費者輕鬆走塑，環保消費！
          </p>
        </div>
        <div className="col-xs-12 col-md-6">
          <div className="column__img">
            <img src={pic2} alt="pic2" />
          </div>
        </div>
      </div>
    </section>
  );
};
