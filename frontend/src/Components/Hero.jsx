import React from 'react'
import { logo } from '../assets';

export const Hero = () => {
  return (
    <header className='w-full flex justify-center items-center flex-col'>
      <nav
        className="flex justify-between items-center w-full mb-10 pt-3">
        <img src={logo} alt="sumz_logo" className='w-28 object-contain' />
        <button type="button" onClick={() => window.open('https://github.com/RizanKhan837')} className='black_btn'>
          Github
        </button>
      </nav>

        <h1 className='head_text'>
        Alot of Resumes Use <br className='max-md:hidden' />
        <span className='orange_gradient '>Resume Analyzer</span>
      </h1>
      <h2 className='desc'>Unleash the Power of AI in Recruiting: Resume Analyzer - Empowering Recruiters to Efficiently Analyze Resumes and Discover the Perfect Fit</h2>
    </header>
  )
}
