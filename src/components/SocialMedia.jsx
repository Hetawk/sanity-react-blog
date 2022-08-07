import React from 'react';
import { BsTwitter, BsInstagram, BsGithub } from 'react-icons/bs';
import { FaFacebookF, FaLinkedinIn } from 'react-icons/fa';


const SocialMedia = () => (
  <div className="app__social">
    <div>
      <a href="https://github.com/Hetawk" target="_blank" rel="noreferrer"><BsGithub /></a>
    </div>
    <div>
      <a href="https://www.linkedin.com/in/enoch-kwateh-dongbo-371a7b117" target="_blank" rel="noreferrer"><FaLinkedinIn /></a>
    </div>
    <div>
      <a href="https://twitter.com/enoch_dongbo" target="_blank" rel="noreferrer"><BsTwitter /></a>
    </div>
    <div>
      <a href="https://www.facebook.com/enoch.dongbo" target="_blank" rel="noreferrer"><FaFacebookF /></a>
    </div>
    <div>
      <a href="https://instagram.com/enoch.dongbo" target="_blank" rel="noreferrer"><BsInstagram /></a>
    </div>
  </div>
);

export default SocialMedia;
