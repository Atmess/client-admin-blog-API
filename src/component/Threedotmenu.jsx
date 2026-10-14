import { useState } from "react";

export default function Threedotmenu({post,handleDeletePost,handleStatusChange,nameForThis}){

    const [activeDropdownId, setActiveDropdownId] = useState(null);
    return( <div className="flex justify-end items-center pt-3 mt-3 border-t border-slate-700/40">
                  <div className="relative">
                    {/* Clickable 3-Dot Button */}
                    <button 
                      onClick={() => setActiveDropdownId(activeDropdownId === post.id ? null : post.id)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition cursor-pointer flex items-center justify-center focus:outline-none"
                      title="More options"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                   {/* 👈 DROPUP MENU CONTAINER */}
                    {activeDropdownId === post.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                        


                        <button
                          onClick={handleStatusChange}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/60 rounded-lg transition font-medium"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {nameForThis} 
                        </button>

                        <div className="border-t border-slate-700/60 my-1"></div>

                        <button
                          onClick={handleDeletePost}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition font-medium"
                        >
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>

                      </div>
                    )}
                  </div>
                </div>  )
}