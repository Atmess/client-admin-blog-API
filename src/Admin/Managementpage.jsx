import { Outlet } from "react-router-dom";
import ActiveTabButton from "../component/Activetab";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Management(){
    const [activeTab, setActiveTab] = useState('drafts'); // 'drafts' | 'published'

    return(<div>
        <div className="flex border-b border-slate-700 gap-4">
            <Link to='/management' >
           <ActiveTabButton
          currentTab={activeTab}
          setActiveTab={setActiveTab}
          nameforthisone={'Users'}
          nameForthis={"Users"}
          />
          </Link>
          <Link to='/management/posts'>
          <ActiveTabButton
          currentTab={activeTab}
          setActiveTab={setActiveTab}
          nameforthisone={'Posts'}
          nameForthis={"Posts"}
          /></Link>
        </div>

        <Outlet/>
    </div>)
}