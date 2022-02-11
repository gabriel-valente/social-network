import React from 'react';
import './FrontPage.css';
import Authentication from 'components/Authentication/Authentication';

const FrontPage = (props) => {
	return (
		<div className='app'>
			<div className='appContent'>
				<div className='appLeftBox'>
					<img className='appLogo' src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png' alt='Not Social Logo' />
					<h3>Welcome to Not Social!</h3>
					<p>
						Tired of every other social network?
						<br />
						Great! Because this isn't a social network.
					</p>
					<p>
						You can thing of this like a...
						<br />
						Social network for people that are not social...
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
