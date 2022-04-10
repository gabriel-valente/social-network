import React from 'react';
import './FrontPage.css';
import Authentication from 'components/Authentication/Authentication';
import logo from 'logo3.png';

const FrontPage = (props) => {
	return (
		<div className='app'>
			<div className='appContent'>
				<div className='appLeftBox'>
					<img className='appLogo' src={logo} alt='Anti Social Logo' />
					<h3>Welcome to Anti Social!</h3>
					<p>
						Tired of every other social network?
						<br />
						Great! Because this isn't a social network.
					</p>
					<p>
						You can thing of this like a...
						<br />
						Anti Social network...
					</p>
				</div>
				<div className='appRightBox'>
					<Authentication {...props} />
				</div>
			</div>
		</div>
	);
};

export default FrontPage;
