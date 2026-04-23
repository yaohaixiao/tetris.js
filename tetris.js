var tetris = (() => {
  var h2 = '#18c8fa',
    f2 = 'rgba(50, 190, 239, 0.3)',
    d2 = '#ff0',
    p2 = 'rgba(255, 255, 0, 0.5)',
    g2 = '#a0a',
    v2 = '#00f',
    u2 = '#ffa500',
    x2 = 'rgba(255, 127, 0, 0.4)',
    w2 = '#0f0',
    y2 = '#5c9d31',
    C2 = 'rgba(0, 255, 0, 0.2)',
    M2 = '#f00',
    S2 = 'rgba(255, 0, 0, 0.4)',
    L2 = '#666',
    E2 = 'rgba(0,0,0,.5)',
    z2 = '#fff',
    T2 = 'rgba(255,255,255,.3)',
    O2 = '#ff4fa3',
    A2 = {
      TEAL: h2,
      RGBA_TEAL: f2,
      YELLOW: d2,
      RGBA_YELLOW: p2,
      PURPLE: g2,
      BLUE: v2,
      ORANGE: u2,
      RGBA_ORANGE: x2,
      GREEN: w2,
      DARK_GREEN: y2,
      RGBA_GREEN: C2,
      RED: M2,
      RGBA_RED: S2,
      BLACK: L2,
      RGBA_BLACK: E2,
      WHITE: z2,
      RGBA_WHITE: T2,
      PINK: O2,
    },
    f = A2;
  var { RGBA_WHITE: x1 } = f,
    B2 = {
      tetris: `<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><rect x="16.568" y="367.165" style="fill:#f9d84e" width="68.409" height="68.409"/><g><rect x="16.568" y="418.472" style="fill:#ffc20d" width="68.409" height="17.102"/><rect x="16.568" y="367.165" style="fill:#ffc20d" width="17.102" height="68.409"/></g><rect x="84.977" y="367.165" style="fill:#f9d84e" width="68.409" height="68.409"/><g><rect x="84.977" y="418.472" style="fill:#ffc20d" width="68.409" height="17.102"/><rect x="84.977" y="367.165" style="fill:#ffc20d" width="17.102" height="68.409"/></g><rect x="84.977" y="298.756" style="fill:#f9d84e" width="68.409" height="68.409"/><g><rect x="84.977" y="350.063" style="fill:#ffc20d" width="68.409" height="17.102"/><rect x="84.977" y="298.756" style="fill:#ffc20d" width="17.102" height="68.409"/></g><rect x="16.568" y="298.756" style="fill:#f9d84e" width="68.409" height="68.409"/><g><rect x="16.568" y="350.063" style="fill:#ffc20d" width="68.409" height="17.102"/><rect x="16.568" y="298.756" style="fill:#ffc20d" width="17.102" height="68.409"/></g><rect x="16.568" y="435.574" style="fill:#b169bf" width="68.409" height="68.409"/><g><rect x="16.568" y="435.574" style="fill:#844a8f" width="17.102" height="68.409"/><rect x="16.568" y="486.881" style="fill:#844a8f" width="68.409" height="17.102"/><rect x="16.568" y="486.881" style="fill:#844a8f" width="17.102" height="17.102"/></g><rect x="84.977" y="435.574" style="fill:#b169bf" width="68.409" height="68.409"/><g><rect x="84.977" y="435.574" style="fill:#844a8f" width="17.102" height="68.409"/><rect x="84.977" y="486.881" style="fill:#844a8f" width="68.409" height="17.102"/><rect x="84.977" y="486.881" style="fill:#844a8f" width="17.102" height="17.102"/></g><rect x="153.386" y="435.574" style="fill:#b169bf" width="68.409" height="68.409"/><g><rect x="153.386" y="435.574" style="fill:#844a8f" width="17.102" height="68.409"/><rect x="153.386" y="486.881" style="fill:#844a8f" width="68.409" height="17.102"/><rect x="153.386" y="486.881" style="fill:#844a8f" width="17.102" height="17.102"/></g><rect x="221.795" y="435.574" style="fill:#b169bf" width="68.409" height="68.409"/><g><rect x="221.795" y="435.574" style="fill:#844a8f" width="17.102" height="68.409"/><rect x="221.795" y="486.881" style="fill:#844a8f" width="68.409" height="17.102"/><rect x="221.795" y="486.881" style="fill:#844a8f" width="17.102" height="17.102"/></g><rect x="221.795" y="367.165" style="fill:#fd5e95" width="68.409" height="68.409"/><g><rect x="221.795" y="418.472" style="fill:#d14d7b" width="68.409" height="17.102"/><rect x="221.795" y="367.165" style="fill:#d14d7b" width="17.102" height="68.409"/></g><rect x="290.205" y="367.165" style="fill:#fd5e95" width="68.409" height="68.409"/><g><rect x="290.205" y="418.472" style="fill:#d14d7b" width="68.409" height="17.102"/><rect x="290.205" y="367.165" style="fill:#d14d7b" width="17.102" height="68.409"/></g><rect x="290.205" y="435.574" style="fill:#fd5e95" width="68.409" height="68.409"/><g><rect x="290.205" y="486.881" style="fill:#d14d7b" width="68.409" height="17.102"/><rect x="290.205" y="435.574" style="fill:#d14d7b" width="17.102" height="68.409"/></g><rect x="358.614" y="435.574" style="fill:#fd5e95" width="68.409" height="68.409"/><g><rect x="358.614" y="486.881" style="fill:#d14d7b" width="68.409" height="17.102"/><rect x="358.614" y="435.574" style="fill:#d14d7b" width="17.102" height="68.409"/></g><rect x="256" y="8.017" style="fill:#fd5e95" width="68.409" height="68.409"/><g><rect x="256" y="59.324" style="fill:#d14d7b" width="68.409" height="17.102"/><rect x="256" y="8.017" style="fill:#d14d7b" width="17.102" height="68.409"/></g><rect x="324.409" y="8.017" style="fill:#fd5e95" width="68.409" height="68.409"/><g><rect x="324.409" y="59.324" style="fill:#d14d7b" width="68.409" height="17.102"/><rect x="324.409" y="8.017" style="fill:#d14d7b" width="17.102" height="68.409"/></g><rect x="324.409" y="76.426" style="fill:#fd5e95" width="68.409" height="68.409"/><g><rect x="324.409" y="127.733" style="fill:#d14d7b" width="68.409" height="17.102"/><rect x="324.409" y="76.426" style="fill:#d14d7b" width="17.102" height="68.409"/></g><rect x="392.818" y="76.426" style="fill:#fd5e95" width="68.409" height="68.409"/><g><rect x="392.818" y="127.733" style="fill:#d14d7b" width="68.409" height="17.102"/><rect x="392.818" y="76.426" style="fill:#d14d7b" width="17.102" height="68.409"/></g><rect x="358.614" y="367.165" style="fill:#7dbb34" width="68.409" height="68.409"/><g><rect x="358.614" y="418.472" style="fill:#60a333" width="68.409" height="17.102"/><rect x="358.614" y="367.165" style="fill:#60a333" width="17.102" height="68.409"/></g><rect x="427.023" y="367.165" style="fill:#7dbb34" width="68.409" height="68.409"/><g><rect x="427.023" y="418.472" style="fill:#60a333" width="68.409" height="17.102"/><rect x="427.023" y="367.165" style="fill:#60a333" width="17.102" height="68.409"/></g><rect x="427.023" y="435.574" style="fill:#7dbb34" width="68.409" height="68.409"/><g><rect x="427.023" y="486.881" style="fill:#60a333" width="68.409" height="17.102"/><rect x="427.023" y="435.574" style="fill:#60a333" width="17.102" height="68.409"/></g><rect x="358.614" y="298.756" style="fill:#7dbb34" width="68.409" height="68.409"/><g><rect x="358.614" y="350.063" style="fill:#60a333" width="68.409" height="17.102"/><rect x="358.614" y="298.756" style="fill:#60a333" width="17.102" height="68.409"/></g><rect x="153.386" y="127.733" style="fill:#45cae0" width="68.409" height="68.409"/><g><rect x="153.386" y="179.04" style="fill:#0aadbf" width="68.409" height="17.102"/><rect x="153.386" y="127.733" style="fill:#0aadbf" width="17.102" height="68.409"/></g><rect x="153.386" y="196.142" style="fill:#45cae0" width="68.409" height="68.409"/><g><rect x="153.386" y="247.449" style="fill:#0aadbf" width="68.409" height="17.102"/><rect x="153.386" y="196.142" style="fill:#0aadbf" width="17.102" height="68.409"/></g><rect x="221.795" y="196.142" style="fill:#45cae0" width="68.409" height="68.409"/><g><rect x="221.795" y="247.449" style="fill:#0aadbf" width="68.409" height="17.102"/><rect x="221.795" y="196.142" style="fill:#0aadbf" width="17.102" height="68.409"/></g><rect x="153.386" y="264.551" style="fill:#45cae0" width="68.409" height="68.409"/><g><rect x="153.386" y="315.858" style="fill:#0aadbf" width="68.409" height="17.102"/><rect x="153.386" y="264.551" style="fill:#0aadbf" width="17.102" height="68.409"/></g><path d="M256,84.443h60.392v60.392c0,4.428,3.588,8.017,8.017,8.017h136.818c4.428,0,8.017-3.588,8.017-8.017V76.426
	c0-4.428-3.588-8.017-8.017-8.017h-60.392V8.017c0-4.428-3.588-8.017-8.017-8.017H256c-4.427,0-8.017,3.588-8.017,8.017v68.409
	C247.983,80.854,251.573,84.443,256,84.443z M332.426,84.443h52.376v52.376h-52.376V84.443z M453.211,136.818h-52.376V84.443h52.376
	V136.818z M384.802,68.409h-52.376V16.033h52.376V68.409z M264.017,16.033h52.376v52.376h-52.376V16.033z"/><path d="M495.432,359.148H435.04v-60.392c0-4.428-3.588-8.017-8.017-8.017h-68.409c-4.428,0-8.017,3.588-8.017,8.017v60.392h-9.086
	c-4.428,0-8.017,3.588-8.017,8.017c0,4.428,3.588,8.017,8.017,8.017h9.086v52.376h-52.376v-52.376h9.086
	c4.428,0,8.017-3.588,8.017-8.017c0-4.428-3.588-8.017-8.017-8.017h-85.511c-4.427,0-8.017,3.588-8.017,8.017v60.392h-52.376v-86.58
	h60.392c4.427,0,8.017-3.588,8.017-8.017v-60.392h60.392c4.428,0,8.017-3.588,8.017-8.017v-68.409c0-4.428-3.588-8.017-8.017-8.017
	h-60.392v-60.392c0-4.428-3.589-8.017-8.017-8.017h-68.409c-4.427,0-8.017,3.588-8.017,8.017v17.102
	c0,4.428,3.589,8.017,8.017,8.017c4.427,0,8.017-3.588,8.017-8.017v-9.086h52.376v52.376h-52.376v-9.086
	c0-4.428-3.589-8.017-8.017-8.017c-4.427,0-8.017,3.588-8.017,8.017v111.699H67.875c-4.427,0-8.017,3.588-8.017,8.017
	s3.589,8.017,8.017,8.017h9.086v52.376H24.585v-52.376h9.086c4.427,0,8.017-3.588,8.017-8.017s-3.589-8.017-8.017-8.017H16.568
	c-4.427,0-8.017,3.588-8.017,8.017v205.228c0,4.428,3.589,8.017,8.017,8.017h478.864c4.428,0,8.017-3.588,8.017-8.017V367.165
	C503.449,362.737,499.861,359.148,495.432,359.148z M487.415,427.557H435.04v-52.376h52.376V427.557z M366.63,375.182h52.376v52.376
	H366.63V375.182z M366.63,306.772h52.376v52.376H366.63V306.772z M229.812,375.182h52.376v52.376h-52.376V375.182z M92.994,375.182
	h52.376v52.376H92.994V375.182z M213.779,324.944h-52.376v-52.376h52.376V324.944z M282.188,256.534h-52.376v-52.376h52.376V256.534
	z M213.779,204.159v52.376h-52.376v-52.376H213.779z M145.37,359.148H92.994v-52.376h52.376V359.148z M76.96,375.182v52.376H24.585
	v-52.376H76.96z M24.585,443.591H76.96v52.376H24.585V443.591z M92.994,443.591h52.376v52.376H92.994V443.591z M161.403,443.591
	h52.376v52.376h-52.376V443.591z M229.812,443.591h52.376v52.376h-52.376V443.591z M298.221,443.591h52.376v52.376h-52.376V443.591z
	 M366.63,443.591h52.376v52.376H366.63V443.591z M487.415,495.967H435.04v-52.376h52.376V495.967z"/></svg>`,
      gamepad:
        '<svg width="800px" height="800px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 30L19 33C19 36.866 15.866 40 12 40V40C8.13401 40 5 36.866 5 33L5 19" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M29 30L29 33C29 36.866 32.134 40 36 40V40C39.866 40 43 36.866 43 33L43 19" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="5" y="8" width="38" height="22" rx="11" fill="#2F88FF" stroke="#000000" stroke-width="4"/><path d="M21 19H13" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 15V23" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="32" y="15" width="4" height="4" rx="2" fill="white"/><rect x="28" y="20" width="4" height="4" rx="2" fill="white"/></svg>',
      tower: `<svg fill="${x1}" height="800px" width="800px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><g><g><path d="M341.512,495.967h-11.975l-33.221-71.978c6.644-8.584,10.613-19.341,10.613-31.012c0-18.862-10.346-35.341-25.653-44.095
			v-134.14c15.308-8.754,25.653-25.234,25.653-44.095c0-25.268-18.556-46.278-42.756-50.133v-11.736
			c9.93-3.354,17.102-12.752,17.102-23.8s-7.172-20.446-17.102-23.8V8.017c0-4.427-3.589-8.017-8.017-8.017
			c-4.427,0-8.017,3.589-8.017,8.017v53.16c-9.93,3.354-17.102,12.752-17.102,23.8s7.172,20.446,17.102,23.8v11.736
			c-24.2,3.855-42.756,24.866-42.756,50.133c0,18.862,10.346,35.341,25.653,44.095V348.88
			c-15.308,8.754-25.653,25.234-25.653,44.095c0,11.555,3.888,22.215,10.414,30.757l-33.337,72.234h-11.975
			c-4.427,0-8.017,3.588-8.017,8.017c0,4.428,3.589,8.017,8.017,8.017h171.026c4.427,0,8.017-3.588,8.017-8.017
			C349.53,499.555,345.94,495.967,341.512,495.967z M247.072,84.977c0-5.01,4.076-9.086,9.086-9.086c5.01,0,9.086,4.076,9.086,9.086
			s-4.076,9.086-9.086,9.086C251.148,94.063,247.072,89.987,247.072,84.977z M222.587,179.574c-0.759-2.851-1.168-5.842-1.168-8.927
			c0-19.155,15.584-34.739,34.739-34.739c19.155,0,34.739,15.584,34.739,34.739c0,3.086-0.409,6.077-1.168,8.927H222.587z
			 M247.072,307.841V289.67h18.171v18.171H247.072z M265.243,323.875v19.16c-2.95-0.536-5.984-0.831-9.086-0.831
			c-3.102,0-6.135,0.295-9.086,0.831v-19.16H265.243z M247.072,273.637v-18.171h18.171v18.171H247.072z M247.072,239.432v-18.844
			c2.95,0.536,5.984,0.831,9.086,0.831c3.102,0,6.135-0.295,9.086-0.831v18.844H247.072z M256.157,205.386
			c-9.366,0-17.87-3.732-24.124-9.778h48.249C274.027,201.654,265.522,205.386,256.157,205.386z M256.158,358.238
			c16.412,0,30.192,11.444,33.806,26.767h-67.611C225.966,369.681,239.746,358.238,256.158,358.238z M231.038,495.967h-30.919
			l28.008-60.684c0.947,0.63,1.921,1.223,2.911,1.789V495.967z M265.243,495.967h-18.171v-18.171h18.171V495.967z M265.243,461.762
			h-18.171v-18.844c2.95,0.536,5.984,0.831,9.086,0.831c3.102,0,6.135-0.295,9.086-0.831V461.762z M256.158,427.716
			c-16.524,0-30.381-11.601-33.879-27.084h67.757C286.539,416.115,272.682,427.716,256.158,427.716z M281.277,495.967v-58.895
			c0.906-0.518,1.797-1.061,2.667-1.633l27.936,60.528H281.277z"/></g></g></svg>`,
      temple: `<svg fill="${x1}" height="800px" width="800px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 455.5 455.5" xml:space="preserve"><g><path d="M446.04,311.886c-0.49-0.158-48.099-15.791-66.289-42.746V239.5h23.909c3.939,0,7.291-2.869,7.901-6.761
		c0.61-3.893-1.706-7.65-5.456-8.856c-0.491-0.158-48.164-15.744-66.354-42.612V151.5h20.653c0.638,0.257,1.077,0.428,1.276,0.506
		c0.95,0.368,1.926,0.542,2.887,0.542c3.208,0,6.234-1.942,7.462-5.113c1.138-2.939,0.416-6.133-1.582-8.305
		c-1.428-2.184-3.892-3.63-6.696-3.63h-0.128c-17.622-7.507-91.585-41.495-127.872-97.059V31.5c0-4.418-3.582-8-8-8s-8,3.582-8,8
		v5.853c-40.849,62.953-130.069,98.34-130.972,98.693c-3.586,1.396-5.669,5.149-4.958,8.932c0.71,3.782,4.014,6.522,7.862,6.522
		h24.068v29.771c-18.19,26.868-65.863,42.454-66.35,42.611c-3.753,1.202-6.072,4.959-5.463,8.854
		c0.609,3.894,3.963,6.765,7.904,6.765h23.909v29.64c-18.19,26.955-65.799,42.588-66.284,42.745
		c-3.75,1.207-6.063,4.964-5.453,8.855s3.964,6.76,7.903,6.76h23.833v112c-4.418,0-8,3.582-8,8s3.582,8,8,8h384c4.418,0,8-3.582,8-8
		s-3.582-8-8-8v-112h23.833c3.938,0,7.288-2.866,7.9-6.756S449.787,313.097,446.04,311.886z M363.751,263.5h-80v-24h80V263.5z
		 M267.751,239.5v24h-80v-24H267.751z M323.751,175.5h-41v-24h41V175.5z M266.751,151.5v24h-79v-24H266.751z M227.362,54.465
		c27.546,37.902,69.589,65.127,99.316,81.035H127.423C156.795,119.897,199.337,92.657,227.362,54.465z M171.751,151.5v24h-40v-24
		H171.751z M128.129,191.5h199.245c9.614,13.489,24.628,24.188,38.618,32H89.51C103.501,215.688,118.515,204.989,128.129,191.5z
		 M171.751,239.5v24h-80v-24H171.751z M88.038,279.5h279.426c9.633,13.489,24.62,24.188,38.573,32H49.465
		C63.418,303.688,78.405,292.989,88.038,279.5z M339.751,439.5h-32v-64h32V439.5z M347.751,359.5h-48c-4.418,0-8,3.582-8,8v72h-8
		v-112h80v112h-8v-72C355.751,363.082,352.17,359.5,347.751,359.5z M243.751,439.5h-32v-64h32V439.5z M251.751,359.5h-48
		c-4.418,0-8,3.582-8,8v72h-8v-112h80v112h-8v-72C259.751,363.082,256.17,359.5,251.751,359.5z M147.751,439.5h-32v-64h32V439.5z
		 M155.751,359.5h-48c-4.418,0-8,3.582-8,8v72h-8v-112h80v112h-8v-72C163.751,363.082,160.17,359.5,155.751,359.5z M51.751,327.5h24
		v112h-24V327.5z M403.751,439.5h-24v-112h24V439.5z"/><path d="M227.751,16c2.11,0,4.17-0.851,5.66-2.34c1.49-1.49,2.34-3.551,2.34-5.66c0-2.101-0.85-4.17-2.34-5.66
		c-1.49-1.49-3.55-2.34-5.66-2.34c-2.11,0-4.17,0.85-5.66,2.34s-2.34,3.56-2.34,5.66c0,2.109,0.85,4.17,2.34,5.66
		C223.581,15.149,225.641,16,227.751,16z"/></g></svg>`,
      coffee: `<svg fill="${x1}" width="800px" height="800px" viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><g><path d="M24.6,25h0.9c2.5,0,4.5-2,4.5-4.5c0-2.3-1.8-4.2-4-4.4V15c0-0.6-0.4-1-1-1H7c-0.6,0-1,0.4-1,1v5c0,3.3,1.6,6.2,4,8H5   c-0.6,0-1,0.4-1,1s0.4,1,1,1h22c0.6,0,1-0.4,1-1s-0.4-1-1-1h-5C23.1,27.2,24,26.2,24.6,25z M28,20.5c0,1.4-1.1,2.5-2.5,2.5   c0.3-0.9,0.5-2,0.5-3v-1.9C27.1,18.3,28,19.3,28,20.5z M24,16v2.4c-1.1,0.5-4.1,1.4-7.6-0.3c-3.5-1.7-6.6-0.8-8.4,0.1V16H24z    M8,20.5c1-0.7,4-2.3,7.5-0.6c1.8,0.9,3.5,1.1,5,1.1c1.4,0,2.6-0.3,3.5-0.5c-0.1,1-0.3,2-0.7,2.8c-0.1,0.1-0.2,0.3-0.2,0.4   c-1.4,2.5-4,4.2-7,4.2C11.8,28,8.3,24.7,8,20.5z"/><path d="M11,11h3c0.3,0,0.5,0.2,0.5,0.5V12c0,0.6,0.4,1,1,1s1-0.4,1-1v-0.5c0-1.4-1.1-2.5-2.5-2.5h-3c-0.3,0-0.5-0.2-0.5-0.5   S10.7,8,11,8h9.5c1.7,0,3-1.3,3-3s-1.3-3-3-3h-10c-0.6,0-1,0.4-1,1s0.4,1,1,1h10c0.6,0,1,0.4,1,1s-0.4,1-1,1H11   C9.6,6,8.5,7.1,8.5,8.5S9.6,11,11,11z"/></g></svg>`,
      happy: `<svg height="800px" width="800px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.003 512.003" xml:space="preserve"><circle style="fill:#fddf6d" cx="256.001" cy="256.001" r="256.001"/><path style="fill:#fcc56b" d="M310.859,474.208c-141.385,0-256-114.615-256-256c0-75.537,32.722-143.422,84.757-190.281
	C56.738,70.303,0,156.525,0,256c0,141.385,114.615,256,256,256c65.849,0,125.883-24.87,171.243-65.718
	C392.325,464.135,352.77,474.208,310.859,474.208z"/><g><path style="fill:#7f184c" d="M245.899,187.172c-5.752,0-10.414-4.663-10.414-10.414c0-13.433-10.928-24.362-24.362-24.362
		c-13.433,0-24.362,10.93-24.362,24.362c0,5.752-4.663,10.414-10.414,10.414c-5.752,0-10.414-4.663-10.414-10.414
		c0-24.918,20.273-45.19,45.19-45.19s45.19,20.272,45.19,45.19C256.314,182.509,251.651,187.172,245.899,187.172z"/><path style="fill:#7f184c" d="M421.798,187.172c-5.752,0-10.414-4.663-10.414-10.414c0-13.433-10.928-24.362-24.362-24.362
		s-24.362,10.93-24.362,24.362c0,5.752-4.663,10.414-10.414,10.414s-10.414-4.663-10.414-10.414c0-24.918,20.273-45.19,45.19-45.19
		s45.19,20.272,45.19,45.19C432.213,182.509,427.55,187.172,421.798,187.172z"/></g><path style="fill:#fff" d="M293.248,443.08L293.248,443.08c-74.004,0-133.995-59.991-133.995-133.995l0,0h267.991l0,0
	C427.243,383.088,367.251,443.08,293.248,443.08z"/><path style="fill:#e6e6e6" d="M172.426,367.092c3.531,7.341,7.718,14.305,12.472,20.829h216.699
	c4.755-6.524,8.941-13.487,12.472-20.829H172.426z"/><g><path style="fill:#f9a880" d="M145.987,240.152c-19.011,0-34.423,15.412-34.423,34.423h68.848
		C180.41,255.564,164.998,240.152,145.987,240.152z"/><path style="fill:#f9a880" d="M446.251,240.152c-19.011,0-34.423,15.412-34.423,34.423h68.848
		C480.676,255.564,465.264,240.152,446.251,240.152z"/></g><ellipse transform="matrix(0.2723 -0.9622 0.9622 0.2723 142.573 335.222)" style="fill:#fceb88" cx="292.913" cy="73.351" rx="29.854" ry="53.46"/></svg>`,
    },
    V = B2;
  var b2 = {
      board: [],
      curr: null,
      cx: 0,
      cy: 0,
      next: null,
      score: 0,
      lines: 0,
      level: 1,
      highScore: 0,
      baseLines: 0,
      clearLines: [],
      mode: 'main-menu',
    },
    w = b2;
  var H2 = {
      recording: !1,
      playing: !1,
      frame: 0,
      data: [],
      cursor: 0,
      startRecord() {
        ((this.recording = !0), (this.data = []), (this.frame = 0));
      },
      stopRecord() {
        this.recording = !1;
      },
      startPlay() {
        ((this.playing = !0), (this.frame = 0), (this.cursor = 0));
      },
      stopPlay() {
        this.playing = !1;
      },
    },
    S = H2;
  var k2 = {
      queue: [],
      enqueue(e) {
        this.queue.push(e);
      },
      flush(e) {
        let { queue: t } = this;
        for (; t.length > 0; ) t.shift().execute(e);
      },
      clear() {
        this.queue.length = 0;
      },
    },
    J = k2;
  var $ = [],
    I = (e) => {
      $.push(e);
    },
    O1 = (e) => {
      for (let t = $.length - 1; t >= 0; t--) $[t].update(e) || $.splice(t, 1);
    },
    A1 = () => {
      let e = $.slice().toSorted((t, o) => t.layer - o.layer);
      for (let t of e) t.render();
    },
    c1 = (e = []) =>
      $.some((t) => {
        let o = t.blocking;
        return e && e.length > 0 ? o && e.includes(t.name) : o;
      });
  var n1 = new AudioContext(),
    R2 = (e, t, o = 0.1, r = 'square') => {
      let i = n1.createOscillator(),
        s = n1.createGain();
      ((i.type = r), (i.frequency.value = e));
      let l = n1.currentTime,
        m = t / 1e3;
      (s.gain.setValueAtTime(0, l),
        s.gain.linearRampToValueAtTime(o, l + 0.01),
        s.gain.exponentialRampToValueAtTime(1e-4, m),
        (s.gain.value = o),
        i.connect(s),
        s.connect(n1.destination),
        i.start(),
        i.stop(l + m),
        i.addEventListener('ended', () => {
          (i.disconnect(), s.disconnect());
        }));
    },
    u = R2;
  var V2 = {
      combo: { shift: 0, speed: 1, volume: 1 },
      tetris: { shift: 2, speed: 1.2, volume: 1.1 },
      perfect: { shift: 5, speed: 0.9, volume: 1.3 },
    },
    G2 = (e, t = !1) => (t ? 'perfect' : e === 4 ? 'tetris' : 'combo'),
    I2 = {
      levelSelect: () => u(523, 80, 0.1, 'sine'),
      levelStart: () => u(1319, 160, 0.22, 'sine'),
      countdown: () => u(784, 180, 0.3, 'sine'),
      move: () => u(330, 60),
      rotate: () => u(440, 60),
      drop: () => u(220, 100),
      fall: () => u(180, 200),
      clear: (e = 1, t = !1) => {
        let o = [
            [440, 587, 698],
            [587, 698, 880],
            [698, 880, 1174],
            [587, 880, 1174],
            [440, 880, 1174],
          ],
          r = [260, 300, 380],
          i = [0.32, 0.3, 0.25],
          s = [160, 320, 480],
          l = G2(e, t),
          m = V2[l],
          h = Math.min(e, o.length - 1),
          d = o[h].map((p) => p + m.shift * 12);
        for (let [p, g] of d.entries())
          setTimeout(() => {
            u(g, r[p] * m.speed, i[p] * m.volume, 'square');
          }, s[p]);
      },
      levelUp: () => {
        (u(523, 220),
          setTimeout(() => u(587, 220), 260),
          setTimeout(() => u(659, 240), 520),
          setTimeout(() => u(784, 260), 780),
          setTimeout(() => u(880, 280), 1060),
          setTimeout(() => u(1047, 320), 1360),
          setTimeout(() => u(1175, 360), 1700),
          setTimeout(() => u(1319, 480), 2080));
      },
      pause: () => u(300, 150),
      secondTick: () => u(880, 50, 0.085, 'sine'),
      resume: () => u(400, 150),
      gameOver: () => {
        (u(330, 200),
          setTimeout(() => u(294, 300), 210),
          setTimeout(() => u(262, 500), 520));
      },
      bgmToggle: () => u(440, 100),
    },
    v = I2;
  var B1 = document.querySelector('#game-board'),
    _2 = B1.getContext('2d'),
    b1 = document.querySelector('#next-piece'),
    P2 = b1.getContext('2d'),
    N2 = 0,
    D2 = 0,
    F2 = {
      gameBoard: B1,
      gameBoardContext: _2,
      nextPiece: b1,
      nextPieceContext: P2,
      fontSize: N2,
      blockSize: D2,
    },
    c = F2;
  function W2() {
    let { gameBoard: e, gameBoardContext: t } = c,
      { width: o, height: r } = e;
    t.clearRect(0, 0, o, r);
  }
  var B = W2;
  var U2 = [0, 100, 300, 500, 800, 1200],
    $2 = '"Press Start 2P", monospace, sans-serif',
    q2 = 99,
    K2 = { CLEAR_SCORES: U2, MAX_LEVEL: q2, FONT_FAMILY: $2 },
    q = K2;
  var Y2 = (e) => {
      let {
          text: t,
          x: o,
          y: r,
          color: i,
          strokeColor: s,
          size: l = 1,
          center: m = !0,
          baseline: h = '',
          stroke: a = !1,
          lineWidth: d = 2,
        } = e,
        { FONT_FAMILY: p } = q,
        { gameBoardContext: g, fontSize: C } = c;
      (g.save(),
        m && (g.textAlign = 'center'),
        h && (g.textBaseline = h),
        (g.font = `${C * l}px ${p}`),
        a &&
          ((g.strokeStyle = s || i), (g.lineWidth = d), g.strokeText(t, o, r)),
        (g.fillStyle = i),
        g.fillText(t, o, r),
        g.restore());
    },
    x = Y2;
  var j2 = () => {
      let { GREEN: e } = f,
        { gameBoard: t } = c,
        { width: o, height: r } = t;
      x({ text: 'TETRIS.JS', x: o / 2, y: r * 0.1, color: e, size: 1.1 });
    },
    b = j2;
  var Q2 = (e) => {
      let { RGBA_BLACK: t } = f,
        { gameBoard: o, gameBoardContext: r } = c,
        { width: i, height: s } = o;
      (r.save(), (r.fillStyle = e || t), r.fillRect(0, 0, i, s), r.restore());
    },
    H = Q2;
  var X2 = (e, t = 1) => {
      let { YELLOW: o, BLACK: r } = f,
        { FONT_FAMILY: i } = q,
        { gameBoard: s, gameBoardContext: l, fontSize: m } = c,
        { width: h, height: a } = s;
      (l.save(),
        (l.textAlign = 'center'),
        (l.textBaseline = 'middle'),
        l.translate(h / 2, a / 2),
        l.scale(t, t),
        (l.font = `${m * 3.25}px ${i}`),
        (l.fillStyle = o),
        (l.strokeStyle = r),
        (l.lineWidth = 6));
      let d = String(e);
      (l.strokeText(d, 0, 0), l.fillText(d, 0, 0), l.restore());
    },
    H1 = X2;
  var J2 = () => {
      let { GREEN: e, BLACK: t } = f,
        { gameBoard: o } = c,
        { width: r, height: i } = o;
      x({
        text: 'GET READY!',
        x: r / 2,
        y: i / 1.46,
        color: e,
        stroke: !0,
        strokeColor: t,
        size: 1.1,
        center: !0,
        baseline: 'top',
      });
    },
    k1 = J2;
  var Z = new Map(),
    L = (e) => {
      if (Z.has(e)) return Z.get(e);
      let t = new Image(),
        o = new Blob([e], { type: 'image/svg+xml' });
      return ((t.src = URL.createObjectURL(o)), Z.set(e, t), t);
    },
    Z2 = () => {
      for (let { url: e } of Z.values()) URL.revokeObjectURL(e);
      Z.clear();
    },
    R1 = (e) => {
      let t = Object.values(e);
      Z2();
      for (let o of t) L(o);
    };
  var e8 = (e, t, o, r, i) => {
      t.complete && (e.save(), e.drawImage(t, o, r, i, i), e.restore());
    },
    _ = e8;
  var t8 = () => {
      let { gameBoard: e, gameBoardContext: t } = c,
        { width: o, height: r } = e,
        i = L(V.gamepad),
        s = Math.floor(o * 0.54),
        l = o / 2 - s / 2,
        m = r / 2 - s * 1.2;
      _(t, i, l, m, s);
    },
    V1 = t8;
  var o8 = (e) => {
      let { gameBoard: t, gameBoardContext: o } = c,
        { width: r, height: i } = t,
        s = new Date().getHours(),
        l = s > 11 ? 'tower' : 'temple',
        m,
        h,
        a,
        d;
      switch (e) {
        case 'main-menu':
        case 'countdown': {
          ((m = L(V.tetris)), (h = r), (a = r / 2 - h / 2), (d = i - h));
          break;
        }
        case 'playing': {
          ((m = L(V[l])),
            (h = r * (s > 11 ? 1.8 : 1.46)),
            (a = r - (s > 11 ? h / 1.6 : h)),
            (d = i - h));
          break;
        }
        case 'paused': {
          ((m = L(V.coffee)),
            (h = r * 0.86),
            (a = r / 2 - h / 2),
            (d = i - h * 0.94));
          break;
        }
        case 'game-over': {
          ((m = L(V.happy)),
            (h = Math.floor(r * 0.42)),
            (a = r / 2 - h / 2),
            (d = i / 2 - h * 1.35));
          break;
        }
      }
      _(o, m, a, d, h);
    },
    k = o8;
  var r8 = (e) => {
      let { number: t, scale: o } = e;
      (B(), H(), b(), k('countdown'), V1(), k1(), H1(t, o));
    },
    w1 = r8;
  var i8 = new Set(['main-menu', 'playing', 'paused', 'game-over']),
    s8 = (e) => {
      !i8.has(e) || w.mode === e || (w.mode = e);
    },
    e1 = s8;
  var c8 = { bgmEnabled: !0, bgmTimer: null },
    E = c8;
  var n8 = {
      TetrisTheme: {
        name: 'TetrisTheme',
        melody: [
          659, 659, 659, 494, 523, 587, 587, 587, 523, 494, 440, 440, 440, 523,
          659, 659, 659, 587, 523, 494, 494, 494, 523, 587, 587, 587, 659, 523,
          523, 523, 440, 440, 440, 440, 587, 587, 587, 784, 880, 880, 880, 784,
          659, 523, 523, 523, 659, 784, 784, 784, 659, 587, 494, 494, 494, 523,
          587, 587, 587, 659, 523, 523, 523, 440, 440, 440, 440, 659, 659, 659,
          523, 523, 587, 587, 587, 494, 494, 523, 523, 523, 440, 440, 415, 415,
          415, 415, 659, 659, 659, 523, 523, 587, 587, 587, 494, 494, 523, 523,
          523, 659, 659, 880, 880, 880, 880, 784, 784, 784, 659, 587, 587, 587,
          523, 494, 494, 494, 523, 587, 587, 587, 659, 523, 523, 523, 440, 440,
          440, 440,
        ],
        duration: 150,
        volume: 0.08,
      },
      Loginska: {
        name: 'Loginska',
        melody: [
          659, 659, 659, 784, 880, 784, 784, 784, 659, 587, 659, 659, 659, 523,
          587, 659, 659, 659, 784, 880, 784, 784, 784, 880, 988, 880, 880, 880,
          784, 659, 587, 587, 587, 659, 523, 587, 587, 587, 659, 784, 784, 784,
          784, 659, 587, 659, 659, 659, 523, 494, 440, 440, 440, 440, 440, 440,
          440,
        ],
        duration: 160,
        volume: 0.07,
      },
      Technotris: {
        name: 'Technotris',
        melody: [
          659, 659, 494, 494, 523, 523, 587, 587, 523, 523, 494, 494, 659, 494,
          523, 587, 523, 494, 440, 494, 523, 587, 659, 659, 659, 587, 523, 494,
          523, 523, 587, 587, 659, 659, 784, 784, 659, 659, 587, 587, 659, 784,
          880, 784, 659, 587, 659, 523, 587, 659, 784, 880, 988, 880, 784, 784,
          880, 988, 1175, 988, 880, 784, 659, 659, 659, 784, 784, 880, 880, 659,
          587, 523, 494, 523, 587, 659, 784, 784, 880, 880, 988, 988, 880, 880,
          784, 784, 659, 659, 587, 587, 523, 523, 494, 523, 587, 659, 587, 523,
          494, 440,
        ],
        duration: 150,
        volume: 0.09,
      },
      FirstDivision: {
        name: 'FirstDivision',
        melody: [
          523, 587, 659, 587, 523, 494, 523, 587, 659, 659, 698, 784, 698, 659,
          587, 659, 523, 587, 523, 587, 659, 698, 784, 698, 659, 587, 523, 494,
          523, 659, 784, 880, 784, 659, 587, 659, 523, 587, 659, 698, 784, 784,
          880, 988, 880, 784, 698, 784, 659, 587, 523, 587, 659, 587, 523, 494,
          523, 587, 659, 587, 523, 494, 523, 587, 523, 494,
        ],
        duration: 180,
        volume: 0.08,
      },
      Korobeiniki: {
        name: 'Korobeiniki',
        melody: [
          659, 494, 523, 587, 523, 494, 440, 494, 523, 587, 659, 523, 587, 659,
          587, 523, 494, 523, 587, 659, 784, 659, 587, 523, 494, 523, 587, 659,
          587, 523, 494, 587, 659, 784, 659, 587, 523, 587, 659, 523, 494, 659,
          784, 880, 784, 659, 587, 659, 784, 880, 784, 659, 587, 523, 587, 659,
          784, 659, 587, 523, 523, 587, 659, 784, 880, 784, 659, 587, 523, 494,
          523, 587, 659, 523, 494, 440, 494, 523, 587, 523, 494, 440, 494, 523,
          587, 659, 659, 784, 880, 784, 659, 587, 659, 523, 587, 659, 587, 523,
          494, 523, 494, 440,
        ],
        duration: 140,
        volume: 0.08,
      },
      JourneyToWest: {
        name: 'JourneyToWest',
        melody: [
          880, 120, 880, 120, 0, 60, 880, 120, 880, 120, 0, 60, 880, 120, 880,
          120, 0, 60, 880, 120, 880, 240, 440, 400, 440, 100, 440, 300, 523,
          400, 587, 400, 587, 100, 87, 300, 659, 500, 880, 400, 880, 100, 880,
          300, 784, 400, 659, 400, 659, 100, 659, 300, 659, 500, 587, 400, 587,
          100, 587, 300, 523, 400, 440, 400, 440, 100, 440, 300, 440, 500, 587,
          300, 587, 200, 659, 300, 784, 400, 784, 200, 784, 200, 880, 400, 988,
          300, 988, 200, 988, 300, 880, 400, 784, 300, 784, 200, 784, 400, 1175,
          150, 1175, 150, 0, 100, 1175, 150, 1175, 150, 0, 100, 880, 300, 880,
          300, 440, 400, 440, 200, 440, 400, 440, 200, 440, 600,
        ],
        duration: 110,
        volume: 0.12,
      },
    },
    U = n8;
  var G1 = (e, t, o = 110, r = 0.05) => {
      (e >= t.length && (e = 0),
        u(t[e], o * 0.8, r),
        (E.bgmTimer = setTimeout(() => {
          G1(e + 1, t, o, r);
        }, o)));
    },
    I1 = G1;
  var l8 = () => {
      (E.bgmTimer && clearTimeout(E.bgmTimer), (E.bgmTimer = null));
    },
    M = l8;
  var a8 = () => {
      let e;
      if (!E.bgmEnabled) return !1;
      switch (n.state.level) {
        case 1:
        case 2: {
          e = U.TetrisTheme;
          break;
        }
        case 3:
        case 4: {
          e = U.Loginska;
          break;
        }
        case 5:
        case 6: {
          e = U.Technotris;
          break;
        }
        case 7:
        case 8: {
          e = U.FirstDivision;
          break;
        }
        case 9:
        case 10: {
          e = U.Korobeiniki;
          break;
        }
        default: {
          e = U.JourneyToWest;
          break;
        }
      }
      let { melody: t, duration: o, volume: r } = e;
      (M(), I1(0, t, o, r));
    },
    R = a8;
  var m8 = { COLS: 10, ROWS: 20 },
    y = m8;
  var {
      PINK: h8,
      BLUE: f8,
      TEAL: d8,
      YELLOW: p8,
      PURPLE: g8,
      ORANGE: v8,
      GREEN: u8,
      RED: x8,
    } = f,
    w8 = [
      { shape: [[1, 1, 1, 1]], color: d8 },
      { shape: [[1, 1, 1, 1, 1]], color: u8 },
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: v8,
      },
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: p8,
      },
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: f8,
      },
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: h8,
      },
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: x8,
      },
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: g8,
      },
    ],
    y1 = w8;
  function y8() {
    let e = Math.floor(Math.random() * y1.length),
      t = y1[e];
    return { ...t, shape: t.shape.map((o) => [...o]) };
  }
  var C1 = y8;
  var C8 = (e, t, o) => {
      let { ROWS: r, COLS: i } = y,
        { curr: s, cx: l, cy: m, board: h } = o;
      if (!s) return !1;
      let a = s.shape;
      for (let d = 0; d < a.length; d++)
        for (let p = 0; p < a[d].length; p++)
          if (a[d][p]) {
            let g = l + p + e,
              C = m + d + t,
              i1 = g < 0 || g >= i || C >= r,
              s1 = C >= 0 && C < r && h[C][g];
            if (i1 || s1) return !0;
          }
      return !1;
    },
    K = C8;
  var M8 = () => {
      let e = n.getMode();
      if (e === 'game-over' || e === 'paused' || e === 'main-menu') return !1;
      (n.setMode('game-over'), n.saveHighScore(), M(), v.gameOver());
    },
    l1 = M8;
  var S8 = () => {
      let { nextPiece: e, nextPieceContext: t } = c,
        { width: o, height: r } = e;
      t.clearRect(0, 0, o, r);
    },
    _1 = S8;
  var L8 = (e) => {
      let { next: t } = e,
        { BLACK: o } = f,
        { nextPiece: r, nextPieceContext: i } = c,
        { width: s, height: l } = r;
      if (!t) return;
      let { shape: m } = t,
        a = Math.floor(s / 5),
        d = Math.floor((s - m[0].length * a) / 2),
        p = Math.floor((l - m.length * a) / 2);
      _1();
      for (let g = 0; g < m.length; g++)
        for (let C = 0; C < m[g].length; C++) {
          if (!m[g][C]) continue;
          let i1 = d + C * a,
            s1 = p + g * a;
          ((i.fillStyle = t.color),
            i.fillRect(i1, s1, a - 2, a - 2),
            (i.strokeStyle = o),
            i.strokeRect(i1, s1, a - 2, a - 2));
        }
    },
    a1 = L8;
  var E8 = (e) => {
      let { COLS: t } = y;
      ((e.curr = e.next
        ? { ...e.next, shape: e.next.shape.map((o) => [...o]) }
        : C1()),
        (e.next = C1()),
        (e.cx = Math.floor(t / 2) - Math.floor(e.curr.shape[0].length / 2)),
        (e.cy = 0),
        a1(e.next),
        K(0, 0, e) && l1());
    },
    P = E8;
  var z8 = () => {
      (n.stop(), (n.rafId = requestAnimationFrame(h1)));
    },
    m1 = z8;
  var T8 = (e, t) => {
      let o = Number(e);
      if (!Number.isFinite(o)) return '';
      let r = Math.max(0, Math.floor(t)),
        i = o < 0 ? '-' : '',
        s = Math.abs(o).toString();
      return i + s.padStart(r, '0');
    },
    O = T8;
  var O8 = (e) => {
      let t = document.querySelector('#level');
      (t && (t.textContent = O(e.level, 2)),
        n.setMode('playing'),
        P(e),
        v.levelStart(),
        setTimeout(() => {
          R();
        }, 250),
        (n.rafId = requestAnimationFrame(m1)));
    },
    P1 = O8;
  var A8 = (e) => {
      let t = { show: !0, number: 3, scale: 4, count: 0, acc: 0 };
      return {
        layer: 100,
        blocking: !0,
        name: 'countdown',
        update(o) {
          return (
            (t.acc += o),
            t.acc < 0.01
              ? !0
              : ((t.acc = 0),
                w1(t),
                t.count++,
                (t.scale = Math.max(1, t.scale - 0.4)),
                t.count >= 50 &&
                  ((t.count = 0),
                  (t.number -= 1),
                  (t.scale = 4),
                  t.number >= 1 && v.countdown()),
                t.number <= 0 ? (this.stop(), !1) : !0)
          );
        },
        stop() {
          (e1('playing'), P1(e));
        },
        render() {
          w1(t);
        },
      };
    },
    N1 = A8;
  var B8 = (e) => {
      I(N1(e));
    },
    D1 = B8;
  var b8 = (e) => {
      ((e.baseLines = (e.level - 1) * 10), D1(e));
    },
    F1 = b8;
  var H8 = (e) => {
      (n.setLevel(e), v.levelSelect());
    },
    A = H8;
  var k8 = {
      LEVEL_ONE: () => {
        A(1);
      },
      LEVEL_TWO: () => {
        A(2);
      },
      LEVEL_THREE: () => {
        A(3);
      },
      LEVEL_FOUR: () => {
        A(4);
      },
      LEVEL_FIVE: () => {
        A(5);
      },
      LEVEL_SIX: () => {
        A(6);
      },
      LEVEL_SEVEN: () => {
        A(7);
      },
      LEVEL_EIGHT: () => {
        A(8);
      },
      LEVEL_NINE: () => {
        A(9);
      },
      LEVEL_TEN: () => {
        A(10);
      },
      CONFIRM: (e, t) => {
        F1(t.state);
      },
    },
    W1 = k8;
  var R8 = (e, t, o) =>
      K(e, t, o) ? !1 : ((o.cx += e), (o.cy += t), v.move(), !0),
    N = R8;
  var V8 = (e) => {
      let { curr: t } = e;
      if (!t) return;
      let o = t.shape;
      ((t.shape = o[0].map((r, i) => o.map((s) => s[i]).toReversed())),
        K(0, 0, e) ? (t.shape = o) : v.rotate());
    },
    U1 = V8;
  var G8 = (e) => {
      let { curr: t } = e,
        o = t.shape;
      for (let r = 0; r < o.length; r++)
        for (let i = 0; i < o[r].length; i++)
          o[r][i] && (e.board[e.cy + r][e.cx + i] = t.color);
    },
    f1 = G8;
  var I8 = (e) => {
      w.level = e;
    },
    Y = I8;
  var _8 = (e, t, o, r) => {
      let { RGBA_BLACK: i } = f,
        { blockSize: s } = c,
        l = s,
        m = 1,
        h = l - m * 2,
        a = t * l + m,
        d = o * l + m;
      ((e.fillStyle = r),
        e.fillRect(a, d, h, h),
        (e.strokeStyle = i),
        e.strokeRect(a, d, h, h));
    },
    j = _8;
  var P8 = (e) => {
      let { COLS: t } = y,
        { gameBoardContext: o } = c;
      for (let r of e.lines) {
        (o.save(), (o.globalAlpha = r.alpha));
        for (let i = 0; i < t; i++) j(o, i, r.y, r.color);
        o.restore();
      }
    },
    $1 = P8;
  var N8 = {
      score: document.querySelector('#score'),
      lines: document.querySelector('#lines'),
      level: document.querySelector('#level'),
      highScore: document.querySelector('#highScore'),
    },
    G = N8;
  var D8 = (e, t, o, r, i) => {
      let s = null;
      if (e === t) return null;
      let l = 0,
        m = 0,
        h = (a) => {
          m || (m = a);
          let d = a - m;
          ((m = a), (l += d));
          let p = Math.min(l / o, 1),
            g = Math.floor(e + (t - e) * p);
          (r(g, s),
            p < 1
              ? (s = requestAnimationFrame(h))
              : (cancelAnimationFrame(s), i?.()));
        };
      return (
        (s = requestAnimationFrame(h)),
        { cancel: () => cancelAnimationFrame(s) }
      );
    },
    q1 = D8;
  var D = (e, t, o = 0) => (e.textContent = o ? O(t, o) : String(t)),
    F8 = () => {
      let e = { score: 0, lines: 0, level: 1, highScore: 0 },
        t = { score: 0 },
        o = { score: !1 },
        r = (a) => {
          ((t.score = a),
            !o.score &&
              ((o.score = !0),
              q1(
                e.score,
                t.score,
                300,
                (d) => {
                  D(G.score, d, 5);
                },
                () => {
                  ((e.score = t.score),
                    (o.score = !1),
                    e.score !== t.score && r(t.score));
                },
              )));
        },
        i = (a) => {
          a !== e.lines && (D(G.lines, a, 2), (e.lines = a));
        },
        s = (a) => {
          a !== e.level && (D(G.level, a, 2), (e.level = a));
        },
        l = (a) => {
          a !== e.highScore && (D(G.highScore, a, 5), (e.highScore = a));
        };
      return {
        update: (a) => {
          (r(a.score), i(a.lines), s(a.level), l(a.highScore));
        },
        reset: () => {
          ((e.score = e.lines = e.level = e.highScore = 0),
            (o.score = !1),
            D(G.score, 0, 5),
            D(G.lines, 0, 2),
            D(G.level, 1, 2),
            D(G.highScore, 0, 5));
        },
      };
    },
    K1 = F8;
  var W8 = (e, t, o, r, i = !1) => {
      let s = K1();
      ((n.getMode() === 'main-menu' || i) && s.reset(),
        s.update({ score: e, lines: t, level: o, highScore: r }));
    },
    F = W8;
  var { TEAL: U8, YELLOW: $8, PURPLE: q8, ORANGE: K8, GREEN: Y8, RED: j8 } = f,
    Q8 = [U8, $8, q8, K8, Y8, j8],
    M1 = Q8;
  var X8 = (e) => {
      let { gameBoardContext: t } = c;
      for (let o of e)
        ((t.globalAlpha = o.alpha),
          (t.fillStyle = o.color),
          t.beginPath(),
          t.arc(o.x, o.y, o.radius, 0, Math.PI * 2),
          t.fill(),
          (o.x += o.vx),
          (o.y += o.vy),
          (o.alpha -= 0.024));
      t.globalAlpha = 1;
    },
    Y1 = X8;
  var J8 = () => {
      let { GREEN: e } = f,
        { gameBoard: t } = c,
        { width: o, height: r } = t;
      x({
        text: 'LEVEL UP',
        x: o / 2,
        y: r / 2.5,
        color: e,
        size: 1.2,
        center: !0,
      });
    },
    j1 = J8;
  var Z8 = (e, t) => {
      let { GREEN: o } = f,
        { gameBoard: r } = c,
        { width: i } = r;
      x({ text: String(e), x: i / 2, y: t, color: o, size: 3, center: !0 });
    },
    d1 = Z8;
  var e3 = () => {
      let { YELLOW: e, BLACK: t } = f,
        { gameBoard: o } = c,
        { width: r, height: i } = o;
      x({
        text: 'CONGRATS!',
        x: r / 2,
        y: i / 1.6,
        color: e,
        stroke: !0,
        strokeColor: t,
        lineWidth: 3,
        size: 1.3,
        center: !0,
      });
    },
    Q1 = e3;
  function t3(e, t) {
    let { gameBoard: o } = c,
      { height: r } = o;
    (H(), b(), j1(), d1(e, r / 1.85), Q1(), Y1(t));
  }
  var X1 = t3;
  var S1 = class {
      constructor(t) {
        ((this.fireworks = this.createFireworks()),
          (this.duration = 3),
          (this.spawnTimer = 0),
          (this.layer = 100),
          (this.blocking = !0),
          (this.timer = 0),
          (this.name = 'level-up'),
          (this.state = t));
      }
      createFireworks() {
        let { width: t, height: o } = c.gameBoard,
          r = [];
        for (let i = 0; i < 40; i++) {
          let s = Math.random() * Math.PI * 2,
            l = 5 + Math.random() * 15;
          r.push({
            x: t / 2,
            y: o / 2 - 60,
            vx: Math.cos(s) * l,
            vy: Math.sin(s) * l,
            radius: 3 + Math.random() * 4,
            color: M1[Math.floor(Math.random() * M1.length)],
            alpha: 1,
          });
        }
        return r;
      }
      update(t) {
        return (
          (this.timer += t),
          (this.spawnTimer += t),
          this.updateFireworks(t),
          this.spawnTimer > 0.6 &&
            (this.fireworks.push(...this.createFireworks()),
            (this.spawnTimer = 0)),
          this.timer >= this.duration ? (this.stop(), !1) : !0
        );
      }
      stop() {
        R();
      }
      updateFireworks(t) {
        for (let r of this.fireworks)
          ((r.vx *= 0.98),
            (r.vy *= 0.98),
            (r.vy += 0.01 * t),
            (r.x += r.vx * t * 0.008),
            (r.y += r.vy * t * 0.008),
            (r.alpha -= t * 0.024),
            (r.radius += t * 10));
        this.fireworks = this.fireworks.filter((r) => r.alpha > 0);
      }
      render() {
        let { fireworks: t, state: o } = this,
          { level: r } = o;
        X1(r, t);
      }
    },
    J1 = S1;
  var o3 = () => {
      let { state: e } = n;
      (M(), v.levelUp(), I(new J1(e)));
    },
    Z1 = o3;
  var L1 = class {
      constructor(t, o) {
        ((this.lines = t.map((r) => ({ y: r, alpha: 1, timer: 0 }))),
          (this.state = o),
          (this.layer = 200),
          (this.blocking = !0),
          (this.name = 'clear-lines'),
          v.clear(t.length - 1));
      }
      update(t) {
        let o = !0;
        for (let r of this.lines) {
          let i = Math.floor(r.timer / 0.12);
          ((r.alpha = i % 2 === 0 ? 1 : 0),
            (r.timer += t),
            r.timer < 0.72 && (o = !1));
        }
        return o ? (this.stop(), !1) : !0;
      }
      stop() {
        let { CLEAR_SCORES: t, MAX_LEVEL: o } = q,
          { ROWS: r, COLS: i } = y,
          { state: s } = this,
          m = (s.clearLines || []).length;
        for (let d = r - 1; d >= 0; d--)
          s.board[d].every(Boolean) &&
            (s.board.splice(d, 1),
            s.board.unshift(Array.from({ length: i }).fill(0)),
            d++);
        ((s.clearLines = []), (s.lines += m), (s.score += t[m] * s.level));
        let h = s.baseLines + s.lines,
          a = Math.floor(h / 10) + 1;
        (a > s.level && Z1(),
          Y(Math.min(Math.max(s.level, a), o)),
          F(s.score, s.lines, s.level, s.highScore));
      }
      render() {
        $1({ lines: this.lines });
      }
    },
    e4 = L1;
  var r3 = (e, t) => {
      let o = new e4(e, t);
      I(o);
    },
    t4 = r3;
  var i3 = (e) => {
      let { ROWS: t } = y,
        o = 0,
        r = [];
      for (let i = t - 1; i >= 0; i--)
        e.board[i].every((l) => !!l) && (r.push(i), o++);
      return o === 0
        ? (n.saveHighScore(), !1)
        : ((e.clearLines = r), t4(r, e), !0);
    },
    p1 = i3;
  var s3 = (e) => {
      for (; N(0, 1, e); );
      (f1(e), v.fall(), p1(e), P(e), v.drop());
    },
    o4 = s3;
  var c3 = (e) => {
      let t = n.getMode();
      if (t === 'paused' || t === 'game-over' || t === 'main-menu') return;
      (M(),
        n.setMode('playing'),
        n.setHud({ score: 0, lines: 0, level: 1 }),
        n.resetBoard());
      let { score: o, lines: r, level: i, highScore: s } = e;
      (F(o, r, i, s, !0), P(e), R(), n.restart());
    },
    r4 = c3;
  var E1 = class {
      constructor(t = 500) {
        ((this.layer = t),
          (this.blocking = !0),
          (this.timer = 0),
          (this.active = !0),
          (this.name = 'paused'));
      }
      update(t) {
        return this.active
          ? ((this.timer += t),
            this.timer >= 1 && (v.secondTick(), (this.timer = 0)),
            !0)
          : !1;
      }
      stop() {
        this.active = !1;
      }
      render() {
        this.active = !0;
      }
    },
    i4 = E1;
  var Q = null,
    s4 = () => {
      Q || ((Q = new i4()), I(Q));
    },
    c4 = () => {
      Q && (Q.stop(), (Q = null));
    };
  var n3 = () => {
      let e = n.getMode();
      if (e === 'game-over' || e === 'main-menu') return !1;
      e === 'playing'
        ? (n.setMode('paused'), M(), v.pause(), s4())
        : (c4(), n.setMode('playing'), v.resume(), R(), n.restart());
    },
    g1 = n3;
  var l3 = () => {
      let e = n.getMode();
      e === 'main-menu' ||
        e === 'paused' ||
        e === 'game-over' ||
        ((E.bgmEnabled = !E.bgmEnabled),
        v.bgmToggle(),
        E.bgmEnabled ? R() : M());
    },
    n4 = l3;
  var a3 = {
      MOVE_LEFT: (e, t) => {
        N(-1, 0, t.state);
      },
      MOVE_RIGHT: (e, t) => {
        N(1, 0, t.state);
      },
      MOVE_DOWN: (e, t) => {
        N(0, 1, t.state);
      },
      DROP: (e, t) => {
        o4(t.state);
      },
      ROTATE: (e, t) => {
        U1(t.state);
      },
      RESTART: (e, t) => {
        r4(t.state);
      },
      QUIT: () => {
        l1();
      },
      TOGGLE_PAUSE: () => {
        g1();
      },
      TOGGLE_MUSIC: () => {
        n4();
      },
    },
    l4 = a3;
  var m3 = {
      TOGGLE_PAUSE: () => {
        g1();
      },
    },
    a4 = m3;
  var h3 = () => {
      let { COLS: e, ROWS: t } = y;
      w.board = Array.from({ length: t }, () =>
        Array.from({ length: e }).fill(0),
      );
    },
    t1 = h3;
  var f3 = (e) => {
      (M(),
        n.start(),
        t1(),
        n.setMode('main-menu'),
        n.setHud({ score: 0, lines: 0, level: 1 }),
        (e.next = null));
      let { score: t, lines: o, level: r, highScore: i } = e;
      F(t, o, r, i);
    },
    m4 = f3;
  var d3 = {
      CONFIRM: (e, t) => {
        m4(t.state);
      },
    },
    h4 = d3;
  var p3 = { 'main-menu': W1, playing: l4, paused: a4, 'game-over': h4 },
    g3 = (e, t) => {
      let { type: o, payload: r } = e,
        i = t.getMode(),
        s = p3[i];
      if (!s) return;
      let l = s[o];
      l?.(r, t);
    },
    f4 = g3;
  var z1 = class {
      constructor(t, o = {}) {
        ((this.type = t), (this.payload = o));
      }
      execute(t) {
        f4(this, t);
      }
    },
    v1 = z1;
  var v3 = (e) => Math.max(100, 1e3 - (e.level - 1) * 80),
    d4 = v3;
  var u3 = (e) => {
      let t = n.getMode();
      return !(
        t === 'main-menu' ||
        t === 'game-over' ||
        c1() ||
        (!N(0, 1, e) && (f1(e), v.fall(), p1(e), P(e), t === 'game-over'))
      );
    },
    p4 = u3;
  var g4 = (e) => {
      n.timestamp || (n.timestamp = e);
      let t = e - n.accumulator,
        o = (e - n.timestamp) / 1e3;
      o > 1e3 && (o = 1e3);
      let r = d4(n.state);
      if (((n.timestamp = e), S.playing)) {
        let { data: i } = S;
        for (; S.cursor < i.length && i[S.cursor].frame === S.frame; ) {
          let s = i[S.cursor];
          (J.enqueue(new v1(s.cmd.type, s.cmd.payload)), S.cursor++);
        }
      }
      (J.flush(n),
        n.update(o),
        S.frame++,
        (!n.accumulator || t > r) && (p4(n.state), (n.accumulator = e)),
        n.render(),
        n.animate(),
        (n.rafId = requestAnimationFrame(g4)));
    },
    h1 = g4;
  var x3 = () => {
      n.rafId &&
        (cancelAnimationFrame(n.rafId),
        (n.rafId = null),
        (n.timestamp = 0),
        (n.accumulator = 0));
    },
    v4 = x3;
  var w3 = () => {
      n.resize();
    },
    u4 = w3;
  var y3 = (e) => {
      let { action: t } = e;
      if (c1(['countdown', 'level-up']) || !t) return;
      let r = new v1(t);
      (J.enqueue(r), S.recording && S.data.push({ frame: S.frame, cmd: r }));
    },
    x4 = y3;
  var C3 = {
      arrowleft: 'MOVE_LEFT',
      arrowright: 'MOVE_RIGHT',
      arrowdown: 'MOVE_DOWN',
      arrowup: 'ROTATE',
      ' ': 'DROP',
      m: 'TOGGLE_MUSIC',
      p: 'TOGGLE_PAUSE',
      r: 'RESTART',
      q: 'QUIT',
      1: 'LEVEL_ONE',
      2: 'LEVEL_TWO',
      3: 'LEVEL_THREE',
      4: 'LEVEL_FOUR',
      5: 'LEVEL_FIVE',
      6: 'LEVEL_SIX',
      7: 'LEVEL_SEVEN',
      8: 'LEVEL_EIGHT',
      9: 'LEVEL_NINE',
      t: 'LEVEL_TEN',
      enter: 'CONFIRM',
    },
    M3 = (e) => {
      if (!e) return;
      let t = e.toLowerCase();
      return C3[t];
    },
    w4 = M3;
  var S3 = (e) => {
      let t = e.key.toLowerCase(),
        o = w4(t);
      o && x4({ type: 'keydown', key: t, action: o });
    },
    y4 = S3;
  var L3 = () => {
      (globalThis.addEventListener('resize', u4),
        document.addEventListener('keydown', y4));
    },
    C4 = L3;
  var E3 = (e) => localStorage.getItem(e),
    M4 = E3;
  var z3 = () => {
      w.highScore = Number.parseInt(M4('tetris-high-score'), 10) || 0;
    },
    T1 = z3;
  var T3 = (e, t) => {
      localStorage.setItem(e, t);
    },
    S4 = T3;
  var O3 = () => {
      let { score: e } = w;
      e > w.highScore &&
        ((w.highScore = e), S4('tetris-high-score', w.highScore.toString()));
    },
    L4 = O3;
  var A3 = () => w.mode,
    E4 = A3;
  var B3 = () => {
      let { GREEN: e } = f,
        { gameBoard: t } = c,
        { width: o, height: r } = t;
      x({
        text: 'LEVEL',
        x: o / 2,
        y: r * 0.35,
        color: e,
        size: 1,
        center: !0,
      });
    },
    z4 = B3;
  var b3 = () => {
      let { WHITE: e } = f,
        { gameBoard: t } = c,
        { width: o, height: r } = t;
      x({
        text: '1-9 or T KEY',
        x: o / 2,
        y: r * 0.58,
        color: e,
        size: 1,
        center: !0,
      });
    },
    T4 = b3;
  var H3 = () => {
      let { TEAL: e } = f,
        { gameBoard: t } = c,
        { width: o, height: r } = t;
      x({
        text: 'ENTER START',
        x: o / 2,
        y: r * 0.74,
        color: e,
        size: 1.15,
        center: !0,
      });
    },
    u1 = H3;
  var k3 = (e) => {
      let { gameBoard: t } = c,
        { height: o } = t;
      (B(), H(), k('main-menu'), b(), z4(), d1(e, o * 0.5), T4(), u1());
    },
    o1 = k3;
  var R3 = (e) => {
      document?.fonts?.load
        ? document.fonts.load('40px "Press Start 2P"').then(() => {
            o1(e.level);
          })
        : setTimeout(() => {
            o1(e.level);
          }, 150);
    },
    O4 = R3;
  var V3 = (e) => {
      o1(e.level);
    },
    A4 = V3;
  var G3 = () => {
      let { YELLOW: e, BLACK: t } = f,
        { gameBoard: o } = c,
        { width: r, height: i } = o;
      x({
        text: 'PAUSED',
        x: r / 2,
        y: i / 1.4,
        color: e,
        strokeColor: t,
        size: 1.6,
        center: !0,
        stroke: !0,
      });
    },
    B4 = G3;
  var I3 = (e, t = 'yyyy-MM-dd HH:mm:ss') => {
      let o = e.getFullYear(),
        r = e.getMonth() + 1,
        i = e.getDate(),
        s = e.getHours(),
        l = e.getMinutes(),
        m = e.getSeconds(),
        h = () => (s >= 12 ? 'PM' : 'AM'),
        a = t.includes('a'),
        d = s % 12 || 12,
        p = {
          yyyy: o,
          MM: O(r, 2),
          dd: O(i, 2),
          HH: O(s, 2),
          hh: O(d, 2),
          mm: O(l, 2),
          ss: O(m, 2),
          a: a ? h() : '',
        },
        g = t;
      for (let C of Object.keys(p)) g = g.replace(new RegExp(C, 'g'), p[C]);
      return g;
    },
    b4 = I3;
  var { GREEN: _3 } = f,
    P3 = (e, t = _3, o = 'HH:mm:ss') => {
      let { gameBoard: r } = c,
        { width: i, height: s } = r,
        l = b4(e || new Date(), o);
      x({ text: l, x: i / 2, y: s / 4.15, color: t, size: 0.94, center: !0 });
    },
    H4 = P3;
  var {
      WHITE: N3,
      PINK: D3,
      TEAL: k4,
      RED: F3,
      ORANGE: R4,
      DARK_GREEN: W3,
      RGBA_TEAL: V4,
      RGBA_GREEN: G4,
    } = f,
    U3 = {
      Teal: { stroke: k4, face: G4, secondHand: R4 },
      Green: { stroke: W3, face: V4, secondHand: k4 },
      Orange: { stroke: R4, face: G4, secondHand: F3 },
      White: { stroke: N3, face: V4, secondHand: D3 },
    },
    r1 = U3;
  var $3 = (e) => {
      let t = e.getHours(),
        o = e.getMinutes(),
        r = e.getSeconds(),
        i = ((t % 12) + o / 60 + r / 3600) * ((2 * Math.PI) / 12),
        s = (o + r / 60) * ((2 * Math.PI) / 60),
        l = r * ((2 * Math.PI) / 60);
      return { hAng: i, mAng: s, sAng: l };
    },
    I4 = $3;
  var { RGBA_ORANGE: z } = f,
    q3 = {
      rat: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M210.432 1012.897684l-43.573895-31.690105c106.954105-147.051789 185.317053-171.196632 423.828211-172.705684 21.396211-31.258947 16.249263-56.266105 9.377684-89.70779-3.557053-17.138526-7.221895-34.842947-7.221895-54.433684 0-68.958316 25.330526-104.636632 63.407158-136.973474l34.896842 41.040842c-29.453474 25.061053-44.409263 46.780632-44.409263 95.932632 0 14.093474 2.937263 28.402526 6.063158 43.546947 5.901474 28.510316 12.8 62.032842-1.131789 99.462737 166.373053-10.24 264.542316-96.902737 264.542315-236.193684C916.210526 418.330947 827.580632 323.368421 684.921263 323.368421c-83.644632 0-153.303579 29.696-174.187789 39.612632a224.875789 224.875789 0 0 1-20.533895 31.339789l-41.741474-34.115368 20.884211 17.057684-20.911158-16.976842C448.781474 359.828211 485.052632 314.287158 485.052632 262.736842c0-34.816-8.946526-60.766316-26.570106-77.069474-17.515789-16.249263-44.786526-24.602947-81.219368-24.953263V323.368421h-53.894737V109.783579l24.872421-1.913263c64.700632-4.931368 114.095158 7.895579 146.863158 38.238316C524.207158 173.056 538.947368 212.291368 538.947368 262.736842c0 11.102316-1.131789 21.908211-3.072 32.202105 37.268211-12.584421 89.842526-25.465263 149.045895-25.465263C858.165895 269.473684 970.105263 387.907368 970.105263 571.176421 970.105263 711.922526 877.487158 862.315789 617.552842 862.315789c-258.667789 0-311.942737 19.698526-407.120842 150.581895z m19.105684-256.835368c-12.045474 0-24.387368-0.565895-37.025684-1.64379l-22.096842-1.859368-2.425263-22.016C167.747368 728.144842 161.684211 672.444632 161.684211 631.026526c0-103.585684 21.450105-178.903579 53.894736-259.045052V107.789474h53.894737v274.782315l-2.021052 4.904422C235.439158 465.758316 215.578947 533.800421 215.578947 631.026526c0 22.878316 2.101895 51.442526 3.826527 70.979369 99.678316 2.802526 172.813474-35.408842 222.450526-116.493474l48.020211 24.090947c-11.237053 28.133053-11.371789 51.577263-0.377264 67.853474 9.701053 14.282105 28.645053 23.174737 49.448421 23.174737v53.894737c-39.019789 0-74.186105-17.515789-94.073263-46.888421a100.244211 100.244211 0 0 1-12.422737-25.546106c-53.221053 49.178947-121.128421 73.943579-202.913684 73.970527zM379.957895 525.473684c0-34.223158-13.231158-44.463158-29.642106-44.463158s-29.642105 10.24-29.642105 44.463158c0 34.250105 13.231158 44.463158 29.642105 44.463158s29.642105-10.213053 29.642106-44.463158z" fill="${z}" /></svg>`,
      ox: `<svg width="800px" height="800px" viewBox="0 -0.5 1025 1025" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M1025.347368 635.580632V916.210526h-53.894736v-71.033263c-16.330105-18.405053-69.820632-70.413474-161.684211-86.069895V916.210526h-53.894737v-161.68421h-107.789473v215.578947h-53.894737V700.631579h161.68421c100.998737 0 172.570947 38.669474 215.578948 71.868632v-115.738948c-33.684211-43.627789-51.712-137.458526-53.706106-279.498105H701.978947c-76.934737 0-127.218526-26.219789-175.804631-51.550316a1556.048842 1556.048842 0 0 0-26.839579-13.743158c-26.839579 26.004211-66.209684 44.921263-115.738948 55.511579 24.441263 22.986105 60.874105 52.116211 106.469053 72.838737l-22.312421 49.044211c-76.584421-34.816-129.589895-88.926316-150.824421-113.125053-10.644211 0.619789-21.477053 1.024-32.687158 1.024a473.734737 473.734737 0 0 1-123.365053-15.952842l-93.022315 186.314105 68.581052 53.86779C167.882105 579.557053 237.891368 538.947368 324.715789 538.947368v53.894737c-95.986526 0-170.361263 62.490947-171.088842 63.137684l-16.78821 14.282106-136.838737-107.358316 109.729684-219.809684C46.430316 314.448842 1.347368 267.371789 1.347368 199.868632 1.347368 89.815579 121.586526 53.894737 163.031579 53.894737v53.894737c-14.120421 0-107.789474 17.165474-107.789474 92.079158C55.242105 290.465684 192.188632 323.368421 284.240842 323.368421c67.907368 0 122.421895-12.988632 157.696-35.624421-42.711579-14.336-95.097263-23.120842-169.337263-18.324211l-3.503158-53.786947c95.878737-6.117053 160.148211 8.515368 211.429053 28.833684C484.244211 235.439158 486.4 225.818947 486.4 215.578947c0-48.855579-57.829053-76.288-58.394947-76.557473l22.393263-49.017263C454.063158 91.648 540.294737 131.826526 540.294737 215.578947c0 18.566737-3.422316 35.84-9.997474 51.631158 7.060211 3.584 13.985684 7.168 20.776421 10.698106C597.854316 302.322526 638.248421 323.368421 701.978947 323.368421h269.473685v26.947368c0 214.689684 35.220211 266.590316 45.999157 277.369264l7.895579 7.895579z m-729.384421 25.141894l-98.789052 118.541474 86.797473 137.835789 45.594948-28.725894-65.913263-104.690527 37.052631-44.43621C358.642526 785.192421 439.080421 808.421053 540.294737 808.421053v-53.894737c-99.893895 0-175.077053-24.549053-223.474526-72.946527l-20.857264-20.857263z" fill="${z}" /></svg>`,
      rabbit: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M862.315789 720.896c0 36.621474-4.122947 69.389474-24.252631 110.349474L769.697684 970.105263H485.052632v-53.894737h48.370526C507.877053 880.074105 485.052632 833.509053 485.052632 781.473684c0-59.418947 24.171789-113.313684 63.218526-152.360421l38.103579 38.103579A161.091368 161.091368 0 0 0 538.947368 781.473684c0 54.784 35.381895 104.043789 63.514948 134.736842h133.712842l53.490526-108.759579c15.710316-31.851789 18.755368-55.834947 18.755369-86.554947 0-80.976842-63.434105-150.096842-178.607158-195.503158-17.542737 8.138105-38.292211 13.554526-63.919158 13.554526h-80.842105c-13.958737 0-43.924211 15.979789-57.290106 40.016843l-47.104-26.165895C401.408 515.449263 448.242526 485.052632 485.052632 485.052632h80.842105c37.268211 0 57.478737-15.440842 79.090526-36.45979C625.367579 336.195368 549.753263 269.473684 485.052632 269.473684h-107.789474a21.288421 21.288421 0 0 0-5.955369 2.021053A683.762526 683.762526 0 0 0 302.187789 194.021053c-35.84-34.223158-61.763368-58.933895-94.908631-79.440842A42.442105 42.442105 0 0 0 185.478737 107.789474a22.824421 22.824421 0 0 0-17.381053 7.194947c-10.913684 11.425684-6.063158 28.240842 1.428211 39.181474 21.989053 32.121263 47.912421 56.858947 83.752421 91.109052 20.614737 19.671579 49.259789 43.169684 77.392842 63.08379C281.007158 367.400421 215.578947 484.432842 215.578947 592.842105c0 74.482526 24.791579 124.065684 51.065264 176.586106C294.534737 825.209263 323.368421 882.903579 323.368421 970.105263h-53.894737c0-74.482526-24.791579-124.065684-51.065263-176.586105C190.517895 737.738105 161.684211 680.043789 161.684211 592.842105c0-90.866526 42.226526-197.685895 93.453473-274.485894a803.759158 803.759158 0 0 1-39.046737-34.115369C177.852632 247.754105 150.231579 221.399579 125.035789 184.616421c-24.441263-35.759158-22.797474-78.686316 4.069053-106.819368 26.300632-27.567158 70.898526-31.043368 106.522947-9.000421 37.941895 23.444211 65.562947 49.798737 103.774316 86.258526 9.970526 9.512421 33.037474 32.309895 56.93979 60.550737h68.634947c-27.621053-37.780211-60.416-72.730947-88.522105-99.543579-28.833684-27.540211-54.730105-52.116211-84.533895-74.024421L326.305684 0.296421c31.232 23.228632 57.802105 48.532211 87.309474 76.719158 53.840842 51.388632 94.450526 100.594526 121.74821 146.83621 82.836211 26.650947 150.042947 116.870737 165.025685 230.750316l1.724631 13.177263-9.404631 9.404632c-3.772632 3.772632-7.706947 7.653053-11.802948 11.587368C837.227789 561.178947 862.315789 663.498105 862.315789 720.896zM309.463579 754.526316c3.934316 8.057263 7.895579 16.087579 11.991579 24.144842C348.887579 832.970105 377.263158 889.128421 377.263158 970.105263h53.894737c0-93.696-34.061474-161.226105-61.520842-215.578947h-60.173474z m597.90821 53.894737c-3.422316 9.404632-7.814737 19.806316-13.770105 31.959579L829.790316 970.105263h60.065684l52.143158-105.957052c10.778947-21.935158 17.515789-40.016842 21.90821-55.727158h-56.535579zM514.694737 390.736842c0-34.223158-13.231158-44.463158-29.642105-44.463158s-29.642105 10.24-29.642106 44.463158c0 34.250105 13.231158 44.463158 29.642106 44.463158s29.642105-10.213053 29.642105-44.463158z" fill="${z}" /></svg>`,
      dragon: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M552.421053 1024c-69.766737 0-113.825684-13.958737-156.402527-27.459368-54.487579-17.273263-110.807579-35.004632-232.421052-26.516211l-3.826527-53.733053c131.718737-9.458526 195.934316 10.967579 252.52379 28.887579 42.226526 13.365895 78.686316 24.926316 140.126316 24.926316 92.752842 0 148.210526-57.936842 148.210526-113.960421 0-16.949895-5.524211-101.618526-114.634105-101.618526-64.970105 0-112.747789 23.336421-163.328 48.02021C365.325474 830.571789 300.301474 862.315789 204.288 862.315789 85.908211 862.315789 0 787.294316 0 683.897263 0 588.126316 80.788211 485.052632 258.182737 485.052632c86.689684 0 155.917474 24.818526 229.214316 51.09221 45.810526 16.410947 92.564211 33.172211 145.488842 44.166737 9.000421-7.033263 13.850947-16.276211 13.850947-26.758737 0-37.187368-37.672421-74.859789-74.13221-111.265684l-3.287579-3.287579 38.103579-38.103579 3.260631 3.287579C652.853895 446.275368 700.631579 494.026105 700.631579 553.552842c0 12.719158-2.802526 24.926316-7.976421 36.109474A594.997895 594.997895 0 0 0 754.526316 592.842105c62.437053 0 107.789474-34.007579 107.789473-80.842105 0-58.853053-52.870737-110.268632-108.840421-164.702316l-8.057263-7.841684c-19.024842 16.437895-38.076632 35.489684-59.418947 56.832l-38.103579-38.103579c74.805895-74.832842 134.898526-134.898526 268.314947-141.931789V55.619368c-63.407158 7.787789-120.993684 39.424-121.667368 39.801264l-15.818105 8.811789-14.120421-11.344842C731.701895 66.452211 709.712842 53.894737 673.684211 53.894737c-41.418105 0-74.347789 25.869474-109.190737 53.301895-26.624 20.911158-54.137263 42.549895-86.851369 53.194105L469.342316 161.684211h-69.093053l-105.525895 105.525894-38.103579-38.130526L324.015158 161.684211H161.684211V107.789474h303.104c22.231579-8.272842 43.708632-25.168842 66.398315-42.981053C569.829053 34.438737 613.618526 0 673.684211 0c48.909474 0 81.408 17.946947 110.888421 40.097684C813.702737 26.300632 877.729684 0 943.157895 0h26.947368v323.368421h-53.894737v-53.167158c-54.164211 3.098947-92.914526 15.845053-127.002947 36.675369l1.832421 1.778526C852.587789 368.505263 916.210526 430.376421 916.210526 512c0 60.928-43.708632 109.945263-107.789473 127.622737V700.631579h53.894736v-53.894737h53.894737v53.894737h53.894737v53.894737h-53.894737v53.894737h-53.894737v-53.894737h-53.894736c-29.722947 0-53.894737-24.171789-53.894737-53.894737v-53.894737c-118.325895 0-207.063579-31.797895-285.318737-59.877053C400.437895 562.229895 335.494737 538.947368 258.182737 538.947368 117.059368 538.947368 53.894737 611.732211 53.894737 683.897263 53.894737 757.221053 115.738947 808.421053 204.288 808.421053c11.910737 0 23.228632-0.538947 34.034526-1.536C248.454737 796.321684 269.473684 770.640842 269.473684 739.166316c0-33.118316-43.088842-70.979368-58.152421-81.596632l30.935579-44.139789c8.299789 5.793684 81.111579 58.664421 81.111579 125.736421 0 19.429053-4.527158 37.052632-10.994526 52.304842 30.773895-10.051368 58.314105-23.498105 86.662737-37.349053C452.877474 727.848421 508.577684 700.631579 585.997474 700.631579 702.410105 700.631579 754.526316 778.725053 754.526316 856.144842 754.526316 938.657684 678.912 1024 552.421053 1024z m-21.180632-623.104L493.136842 362.792421l137.889684-137.889684 38.103579 38.103579-137.889684 137.889684z m-126.760421-18.351158l-38.103579-38.103579 152.980211-152.98021 38.103579 38.103579-152.980211 152.98021z m282.004211-218.624c15.494737-9.754947 43.331368-31.447579 43.331368-31.447579-25.734737-27.809684-49.556211-33.333895-67.368421-29.07621-19.240421 4.608-37.753263 24.602947-37.753263 24.602947s42.253474 22.447158 61.790316 35.920842z" fill="${z}" /></svg>`,
      tiger: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M673.684211 1024c-114.768842 0-188.820211-33.333895-254.167579-62.787368-53.625263-24.144842-99.974737-45.002105-161.28-45.002106-40.448 0-83.590737 23.255579-103.639579 45.16379l-39.747369-36.432842C142.497684 894.787368 199.168 862.315789 258.236632 862.315789c68.392421 0 119.861895 21.288421 172.921263 45.056V673.684211c0-35.166316-17.542737-64.107789-30.639158-80.815158-15.198316 9.835789-32.067368 18.890105-50.741895 26.947368l-21.342316-49.475368C469.800421 509.413053 485.052632 377.317053 485.052632 323.368421V221.642105A597.827368 597.827368 0 0 0 404.210526 215.578947h-26.947368V134.736842c0-12.099368-14.848-26.947368-26.947369-26.947368-9.377684 0-18.836211 0.592842-26.947368 1.347368V269.473684h-53.894737V211.671579c-136.030316 102.912-158.450526 266.886737-161.306947 295.882105 9.135158 9.108211 38.992842 25.061053 71.976421 38.669474l38.103579-59.365053 12.449684-1.589894C321.212632 473.653895 377.263158 392.192 377.263158 323.368421h53.894737c0 88.333474-68.796632 192.242526-180.870737 213.342316l-48.397474 75.398737-20.291368-7.437474C53.894737 557.756632 53.894737 523.317895 53.894737 512c0-50.041263 37.025684-254.733474 215.578947-365.621895V62.490947l22.528-3.745684C293.187368 58.556632 321.482105 53.894737 350.315789 53.894737c41.552842 0 80.842105 39.289263 80.842106 80.842105v27.513263c248.697263 10.563368 592.842105 165.295158 592.842105 484.486737 0 185.451789-131.018105 377.263158-350.315789 377.263158z m-13.473685-323.368421c-36.513684 0-67.368421 49.367579-67.368421 107.789474 0 85.746526 68.096 145.084632 89.465263 161.549473 91.540211-2.533053 164.378947-45.487158 213.827369-107.654737H700.631579v-53.894736h230.238316c8.919579-17.273263 16.357053-35.354947 22.285473-53.894737h-239.885473l-6.467369-17.650527C706.290526 735.582316 692.439579 700.631579 660.210526 700.631579zM485.052632 931.112421c33.926737 14.066526 70.521263 26.597053 114.607157 33.468632C569.424842 928.309895 538.947368 875.223579 538.947368 808.421053c0-90.650947 53.274947-161.684211 121.263158-161.684211 44.759579 0 73.835789 28.779789 88.68379 53.894737h217.007158c2.775579-17.866105 4.203789-35.920842 4.203789-53.894737 0-38.938947-5.658947-74.752-15.925895-107.627789l-126.706526 126.679579-38.103579-38.103579L932.001684 485.052632a367.939368 367.939368 0 0 0-57.775158-81.596632l-154.543158 154.543158-38.103579-38.103579 153.573053-153.573053a537.869474 537.869474 0 0 0-82.593684-56.751158l-140.665263 140.638316-38.103579-38.103579 128.134737-128.134737A794.731789 794.731789 0 0 0 538.947368 231.046737V323.368421c0 50.149053-11.102316 156.698947-95.932631 236.328421 18.378105 23.417263 42.037895 63.407158 42.037895 113.987369v257.42821zM215.578947 431.157895v-53.894737c39.774316 0 53.894737-29.022316 53.894737-53.894737h53.894737c0 53.571368-37.025684 107.789474-107.789474 107.789474z" fill="${z}" /></svg>`,
      snake: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M671.528421 788.857263c44.328421 11.964632 89.626947 19.563789 136.892632 19.56379 89.168842 0 161.684211-60.442947 161.68421-134.736842s-72.515368-134.736842-161.68421-134.736843c-19.078737 0-37.025684 1.509053-54.218106 4.015158-0.754526-101.402947-38.211368-172.355368-79.413894-219.648L673.684211 323.368421a1749.962105 1749.962105 0 0 1-79.036632-1.751579c45.702737 35.866947 108.705684 107.870316 105.984 232.367158 0 0.431158-0.080842 0.808421-0.10779 1.239579-34.923789 10.994526-66.155789 26.731789-95.097263 45.190737a163.085474 163.085474 0 0 0-15.845052-42.388211c-21.557895-39.639579-60.065684-66.775579-97.360842-93.022316C433.098105 423.343158 377.263158 384 377.263158 296.421053c0-130.290526 108.274526-188.631579 215.578947-188.631579 64.134737 0 132.715789 12.045474 214.366316 37.807158C802.330947 180.250947 780.099368 209.381053 700.631579 214.635789V161.684211h-53.894737v53.679157c-63.272421-1.024-104.528842-5.200842-104.986947-5.254736l-5.578106 53.598315C538.408421 263.949474 592.357053 269.473684 673.684211 269.473684c125.170526 0 188.631579-48.128 188.631578-143.063579V106.981053l-18.432-6.144C747.789474 68.823579 668.025263 53.894737 592.842105 53.894737c-158.666105 0-269.473684 99.732211-269.473684 242.526316 0 115.550316 76.422737 169.391158 137.83579 212.614736 33.684211 23.713684 65.509053 46.106947 81.003789 74.698106 9.539368 17.542737 13.285053 33.414737 12.341895 47.750737 21.153684 9.108211 42.118737 17.839158 62.949052 25.977263C671.151158 620.193684 729.977263 592.842105 808.421053 592.842105c59.445895 0 107.789474 36.271158 107.789473 80.842106s-48.343579 80.842105-107.789473 80.842105c-105.472 0-203.237053-42.388211-297.768421-83.429053-94.800842-41.094737-184.346947-79.952842-281.411369-79.952842C122.718316 591.171368 53.894737 644.715789 53.894737 727.578947c0 79.063579 67.098947 136.434526 159.555368 136.434527 142.174316 0 230.426947-66.883368 306.79579-129.886316 31.420632 13.419789 62.787368 26.058105 94.450526 37.133474-47.077053 49.637053-110.969263 82.566737-186.610526 91.270736l5.066105 53.625264c93.453474-7.006316 143.144421 9.350737 195.718737 26.543157 46.457263 15.225263 94.127158 30.854737 169.822316 30.854737 19.994947 0 41.957053-1.077895 66.344421-3.557052l-5.416421-53.625263c-105.283368 10.778947-158.100211-6.548211-213.935158-24.872422-22.150737-7.275789-44.624842-14.632421-70.305684-20.345263a334.848 334.848 0 0 0 96.14821-82.297263z m-458.078316 21.261474C162.573474 810.118737 107.789474 784.276211 107.789474 727.578947c0-60.847158 62.733474-82.539789 121.451789-82.539789 77.850947 0 154.731789 30.288842 235.250526 64.943158-66.263579 52.924632-139.722105 100.136421-251.041684 100.136421z" fill="${z}" /></svg>`,
      horse: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M1024 0v404.210526c0 33.333895 0 134.736842-92.079158 134.736842h-13.824l-78.362947-109.056c-22.743579 49.906526-40.340211 103.046737-53.490527 162.950737h115.092211C937.310316 592.842105 970.105263 625.637053 970.105263 661.638737c0 60.631579-69.389474 154.300632-77.312 164.75621l-43.008-32.471579C875.466105 759.861895 916.210526 693.813895 916.210526 661.638737c0-5.982316-8.919579-14.901895-14.901894-14.901895h-125.332211C761.128421 736.121263 754.526316 840.569263 754.526316 970.105263h-53.894737c0-283.971368 31.097263-453.605053 110.888421-605.049263l20.318316-38.534737 112.801684 156.995369c14.443789-4.419368 25.465263-20.938105 25.465263-79.306106V0h53.894737z m-161.684211 161.684211h53.894737V0h-53.894737v80.842105c-17.381053-14.955789-38.184421-26.947368-80.842105-26.947368h-134.736842v53.894737h134.736842c37.672421 0 80.842105 40.906105 80.842105 53.894737z m-107.789473 0h-215.578948v53.894736h161.684211l53.894737-53.894736zM300.894316 766.544842L400.680421 916.210526h64.754526l-95.043368-142.551579L498.876632 646.736842h167.855157a1212.631579 1212.631579 0 0 1 9.431579-53.894737h-199.383579l-175.885473 173.702737z m109.97221-184.400842l-37.861052-38.319158-132.419369 130.802526C173.729684 571.095579 161.684211 529.812211 161.684211 469.315368 161.684211 398.578526 199.464421 323.368421 269.473684 323.368421h323.368421l53.894737-53.894737H269.473684c-6.709895 0-13.258105 0.565895-19.698526 1.482105C234.927158 249.451789 204.638316 215.578947 160.633263 215.578947 65.967158 215.578947 0 349.291789 0 469.315368c0 70.170947 16.141474 136.650105 49.232842 202.671158L6.197895 723.833263l41.472 34.41179 66.128842-79.737264-8.704-16.033684C83.105684 622.133895 53.894737 558.214737 53.894737 469.315368 53.894737 368.451368 106.765474 269.473684 160.633263 269.473684c13.231158 0 25.815579 9.889684 35.43579 20.533895C142.874947 321.967158 107.789474 388.500211 107.789474 469.315368c0 78.201263 19.698526 130.937263 93.642105 243.981474l-55.296 54.622316L280.899368 970.105263h64.754527l-130.048-195.072 195.260631-192.889263z" fill="${z}" /></svg>`,
      goat: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M608.256 144.734316C555.762526 115.577263 506.098526 107.789474 485.052632 107.789474V53.894737c32.579368 0 91.270737 11.452632 149.369263 43.735579 75.290947 41.822316 130.694737 94.531368 171.385263 150.878316C755.873684 288.013474 697.101474 323.368421 646.736842 323.368421h-107.789474v-53.894737h107.789474c20.506947 0 48.424421-11.210105 80.437895-31.285895a471.04 471.04 0 0 0-118.918737-93.453473zM832.673684 342.231579c-16.384 0-29.642105 10.24-29.642105 44.463158 0 34.250105 13.231158 44.463158 29.642105 44.463158s29.642105-10.213053 29.642105-44.463158c0-34.223158-13.231158-44.463158-29.642105-44.463158zM1024 619.789474C1024 347.109053 901.066105 122.448842 686.753684 3.395368l-26.165895 47.104C914.324211 191.461053 964.688842 440.400842 969.647158 592.842105h-84.506947c-17.92-35.624421-45.352421-69.12-87.013053-101.995789l-16.788211-13.285053-16.734315 13.392842c-66.128842 52.897684-134.629053 127.083789-187.311158 209.677474H102.965895l-8.272842-20.318316C159.043368 617.013895 161.684211 603.109053 161.684211 485.052632v-53.894737h485.052631v-53.894737H161.684211c0-80.384 14.309053-110.026105 66.586947-137.916632l-25.384421-47.535158C123.365053 234.226526 107.789474 291.920842 107.789474 377.263158v107.789474c0 107.600842 0 107.600842-63.649685 169.283368l-13.069473 12.665263L110.618947 862.315789h58.206316l-43.897263-107.789473h103.477895l43.897263 107.789473h58.206316l-43.897263-107.789473h259.47621C508.981895 824.939789 485.052632 899.152842 485.052632 970.105263h53.894736c0-68.688842 27.270737-144.060632 68.958316-215.578947H687.157895c7.410526 0 13.473684 6.063158 13.473684 13.473684V862.315789h53.894737v-94.315789c0-37.160421-30.208-67.368421-67.368421-67.368421h-44.65179c40.771368-58.017684 89.438316-111.427368 138.913684-153.626947C841.512421 600.037053 862.315789 655.225263 862.315789 754.526316h53.894737c0-38.912-2.748632-74.482526-11.102315-107.789474H1024v-26.947368z" fill="${z}" /></svg>`,
      monkey: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M538.947368 1024h-53.894736c0-32.794947 25.869474-87.417263 77.446736-103.316211C528.599579 881.152 485.052632 822.433684 485.052632 781.473684c0-44.570947 36.271158-80.842105 80.842105-80.842105h80.842105v53.894737h-80.842105a26.947368 26.947368 0 0 0-26.947369 26.947368c0 19.725474 36.675368 77.473684 92.133053 134.736842h88.602947c20.210526-14.147368 88.737684-71.464421 88.737685-198.602105 0-108.382316-93.237895-202.967579-168.151579-278.986105-49.502316-50.202947-88.576-89.842526-98.735158-128.61979-11.749053-44.732632-21.584842-112.586105-26.327579-148.318315H377.263158c-45.136842 0-89.519158 8.434526-121.802105 53.894736H431.157895v53.894737c-97.28 0-107.789474 113.071158-107.789474 161.684211v53.894737h53.894737v161.68421h-53.894737v-107.789474h-26.947368c-170.253474 0-188.631579-94.234947-188.631579-134.736842 0-31.043368 35.220211-72.326737 55.727158-93.722947 2.694737-14.686316 5.847579-28.348632 9.431579-41.013895H161.684211V215.578947h31.528421C239.642947 120.993684 317.224421 107.789474 377.263158 107.789474h185.640421l2.802526 23.794526c0.134737 1.050947 12.719158 106.657684 27.944421 164.756211 6.494316 24.872421 44.624842 63.514947 84.965053 104.448C760.481684 483.813053 862.315789 587.129263 862.315789 717.608421c0 92.375579-31.124211 155.028211-61.898105 194.425263C904.919579 892.146526 970.105263 803.004632 970.105263 673.684211c0-91.405474-42.819368-154.381474-84.237474-215.255579C847.791158 402.458947 808.421053 344.576 808.421053 269.473684c0-119.349895 87.093895-161.684211 161.68421-161.68421v53.894737c-32.417684 0-107.789474 10.509474-107.789474 107.789473 0 58.502737 31.555368 104.933053 68.096 158.639158C974.282105 492.597895 1024 565.679158 1024 673.684211c0 177.286737-108.301474 296.421053-269.473684 296.421052h-161.684211c-37.672421 0-53.894737 40.906105-53.894737 53.894737zM229.214316 269.473684a384.808421 384.808421 0 0 0-14.012632 58.341053l-1.401263 8.488421-6.090105 6.117053c-22.878316 22.932211-44.813474 52.601263-46.026105 62.275368 0 56.805053 53.76 75.264 107.789473 79.386947V431.157895c0-58.691368 13.473684-119.619368 46.511158-161.684211h-86.770526zM323.368421 1024h-53.894737c0-32.794947 25.869474-87.417263 77.446737-103.316211C313.020632 881.152 269.473684 822.433684 269.473684 781.473684c0-44.570947 36.271158-80.842105 80.842105-80.842105h45.16379A188.847158 188.847158 0 0 1 565.894737 592.842105h134.736842v53.894737h-134.736842c-74.293895 0-134.736842 60.442947-134.736842 134.736842v26.516211l-53.894737 0.377263V781.473684c0-9.162105 0.646737-18.135579 1.913263-26.947368H350.315789c-14.848 0-26.947368 12.072421-26.947368 26.947368 0 19.725474 36.675368 77.473684 92.133053 134.736842H431.157895v53.894737h-53.894737c-37.672421 0-53.894737 40.906105-53.894737 53.894737z" fill="${z}" /></svg>`,
      rooster: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M673.684211 354.357895c-16.384 0-29.642105-10.213053-29.642106-44.463158 0-34.223158 13.231158-44.463158 29.642106-44.463158s29.642105 10.24 29.642105 44.463158c0 34.250105-13.258105 44.463158-29.642105 44.463158zM540.106105 970.105263l-50.58021-107.789474h156.05221l50.607158 107.789474h59.553684l-51.60421-109.918316C811.52 846.821053 916.210526 764.550737 916.210526 646.736842c0-53.032421-11.910737-95.420632-24.522105-140.314947C877.244632 455.033263 862.315789 401.893053 862.315789 323.368421V107.789474c0-59.445895-48.343579-107.789474-107.789473-107.789474a107.924211 107.924211 0 0 0-107.789474 106.172632 100.890947 100.890947 0 0 0-24.117895-3.314527 88.710737 88.710737 0 0 0-88.602947 88.602948c0 20.668632 5.227789 39.720421 10.671158 53.921684l-99.489684 59.688421 93.749894 14.470737V377.263158c0 14.416842-5.901474 21.692632-33.360842 49.152l-11.129263 11.129263C398.228211 326.521263 324.985263 269.473684 215.740632 269.473684 96.768 269.473684 0 366.241684 0 485.214316V646.736842h53.894737v-161.522526A162.007579 162.007579 0 0 1 215.740632 323.368421c82.081684 0 140.422737 36.244211 240.64 152.252632l-38.615579 38.615579C367.804632 461.285053 323.098947 431.157895 259.584 431.157895A151.983158 151.983158 0 0 0 107.789474 582.952421V754.526316h53.894737v-171.573895A98.007579 98.007579 0 0 1 259.584 485.052632c46.322526 0 79.629474 20.911158 137.027368 86.016l18.970948 21.530947 128.080842-128.080842C572.200421 435.981474 592.842105 415.366737 592.842105 377.263158v-97.926737l23.309474-14.120421-13.662316-23.04c-0.161684-0.242526-14.578526-24.899368-14.578526-50.688 0-19.132632 15.575579-34.708211 34.70821-34.708211 5.093053 0 26.785684 3.179789 39.558737 18.647579l26.327579 46.026106 39.774316-24.090948-20.372211-49.367579C704.754526 140.449684 700.631579 117.517474 700.631579 107.789474c0-29.722947 24.171789-53.894737 53.894737-53.894737s53.894737 24.171789 53.894737 53.894737v215.578947c0 85.935158 16.680421 145.300211 31.366736 197.632C851.887158 564.008421 862.315789 601.141895 862.315789 646.736842c0 95.285895-99.408842 161.684211-188.631578 161.684211h-209.461895l-68.419369-145.704421C375.242105 618.954105 338.108632 592.842105 296.448 592.842105A80.976842 80.976842 0 0 0 215.578947 673.711158V862.315789h53.894737v-188.604631c0-14.874947 12.099368-26.974316 26.974316-26.974316 20.533895 0 38.965895 14.147368 50.553263 38.858105L480.579368 970.105263h59.526737z" fill="${z}" /></svg>`,
      dog: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M326.063158 282.947368c0 34.250105-13.231158 44.463158-29.642105 44.463158s-29.642105-10.213053-29.642106-44.463158c0-34.223158 13.231158-44.463158 29.642106-44.463157s29.642105 10.24 29.642105 44.463157zM269.473684 430.295579v311.646316L190.275368 916.210526h59.203369L323.368421 753.637053V377.263158h-26.947368c-119.403789 0-172.732632-53.382737-185.505685-107.789474h35.624421c51.092211 0 68.581053-15.764211 120.535579-62.544842 12.773053-11.506526 28.079158-25.276632 47.023158-41.741474l18.351158-15.952842-69.658947-99.139368-44.085895 30.989474 41.768421 59.472842c-11.183158 9.862737-20.884211 18.593684-29.480421 26.327579C180.736 212.156632 176.235789 215.578947 146.539789 215.578947H53.894737v26.947369c0 88.710737 66.910316 178.149053 215.578947 187.769263z m216.710737-161.414737c2.290526 71.733895 28.698947 136.326737 75.048421 182.918737C618.711579 509.628632 702.437053 538.947368 810.091789 538.947368c18.593684 0 36.190316-1.158737 52.628211-3.449263 3.745684 111.265684 33.630316 170.334316 51.496421 196.015158l-38.507789 84.722526C782.174316 742.049684 688.774737 700.631579 377.263158 700.631579v53.894737c34.277053 0 65.697684 0.512 94.639158 1.509052L374.595368 970.105263h59.203369l96.013474-211.240421c66.182737 4.338526 117.005474 11.829895 157.911578 22.016L626.229895 916.210526h59.176421l54.16421-119.134315c47.616 18.405053 79.737263 42.091789 113.125053 69.739789L805.753263 970.105263h59.203369l113.071157-248.778105-13.824-13.204211c-0.485053-0.458105-45.648842-47.589053-47.939368-185.263158C985.168842 498.553263 1024 447.811368 1024 377.263158c0-95.205053-66.506105-161.684211-161.684211-161.684211v53.894737c65.482105 0 107.789474 42.307368 107.789474 107.789474 0 89.088-87.013053 107.789474-160.013474 107.789474-92.752842 0-163.624421-23.983158-210.647578-71.27579-30.315789-30.504421-45.891368-65.832421-53.35579-98.735158 11.210105 6.952421 22.932211 13.338947 35.274105 19.186527l23.04-48.720843c-92.106105-43.654737-148.992-128.646737-219.243789-243.981473l-46.026105 28.05221c49.448421 81.246316 92.968421 148.506947 147.051789 199.302737z" fill="${z}" /></svg>`,
      pig: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M808.421053 700.631579v53.894737c-196.446316 0-323.368421 84.641684-323.368421 215.578947h-53.894737c0-163.705263 148.075789-269.473684 377.263158-269.473684z m-323.368421 107.789474v-53.894737c-158.342737 0-245.598316 0-319.649685-49.367579L158.612211 700.631579H80.842105c-21.692632 0-26.624-14.821053-26.947368-26.947368v-82.620632c84.156632-11.183158 161.684211-74.913684 161.68421-186.853053V215.578947H161.684211v161.684211H134.736842c-66.964211 0-134.736842 37.025684-134.736842 107.789474h53.894737c0-42.630737 52.870737-53.894737 80.842105-53.894737h24.629895C147.132632 504.912842 85.153684 538.947368 26.947368 538.947368H0v134.736843c0 32.498526 21.530947 80.842105 80.842105 80.842105h61.682527c32.687158 20.506947 67.125895 33.145263 105.957052 41.013895A232.879158 232.879158 0 0 0 215.578947 916.210526h53.894737c0-41.930105 14.012632-80.303158 39.424-112.505263C358.885053 808.151579 415.959579 808.421053 485.052632 808.421053z m-72.946527-342.420211L323.368421 554.738526V431.157895h-53.894737v253.682526l180.736-180.736-38.103579-38.103579zM323.368421 161.684211h-53.894737v190.032842a769.536 769.536 0 0 1 53.894737-49.098106V161.684211z m323.368421-53.894737c-72.623158 0-146.809263 23.336421-215.578947 58.637473V107.789474h-53.894737v154.138947C458.832842 205.392842 555.331368 161.684211 646.736842 161.684211c148.587789 0 269.473684 120.885895 269.473684 269.473684v235.654737L809.579789 862.315789h61.359158L970.105263 680.555789V431.157895c0-178.310737-145.057684-323.368421-323.368421-323.368421z" fill="${z}" /></svg>`,
    },
    _4 = q3;
  var K3 = (e) =>
      [
        'rat',
        'ox',
        'ox',
        'tiger',
        'tiger',
        'rabbit',
        'rabbit',
        'dragon',
        'dragon',
        'snake',
        'snake',
        'horse',
        'horse',
        'goat',
        'goat',
        'monkey',
        'monkey',
        'rooster',
        'rooster',
        'dog',
        'dog',
        'pig',
        'pig',
        'rat',
      ][e],
    P4 = K3;
  var Y3 = () => {
      let { gameBoard: e, gameBoardContext: t } = c,
        { width: o } = e,
        i = new Date().getHours(),
        s = P4(i - 1),
        l = L(_4[s]),
        m = Math.floor(o * 0.38),
        h = -m / 2,
        a = -m / 2;
      _(t, l, h, a, m);
    },
    N4 = Y3;
  var j3 = (e, t) => {
      let { gameBoardContext: o } = c;
      (o.save(),
        o.beginPath(),
        o.arc(0, 0, e, 0, Math.PI * 2),
        (o.fillStyle = t.face),
        o.fill(),
        (o.lineWidth = Math.floor(e * 0.2)),
        (o.strokeStyle = t.stroke),
        o.stroke(),
        o.restore());
    },
    D4 = j3;
  var Q3 = (e, t) => {
      let { gameBoardContext: o } = c,
        r = Math.floor(e * 0.06),
        i = e - Math.floor(e * 0.25);
      for (let s = 0; s < 12; s++)
        (o.save(),
          o.rotate((s * Math.PI) / 6),
          o.beginPath(),
          o.arc(0, -i, r, 0, Math.PI * 2),
          (o.fillStyle = t.stroke),
          o.fill(),
          o.restore());
    },
    F4 = Q3;
  var X3 = (e, t, o) => {
      let { gameBoardContext: r } = c,
        { hAng: i, mAng: s, sAng: l } = t;
      (r.save(),
        r.rotate(i),
        (r.lineWidth = 5),
        (r.strokeStyle = o.stroke),
        r.beginPath(),
        r.moveTo(0, 0),
        r.lineTo(0, -e * 0.4),
        r.stroke(),
        r.restore(),
        r.save(),
        r.rotate(s),
        (r.lineWidth = 4),
        (r.strokeStyle = o.stroke),
        r.beginPath(),
        r.moveTo(0, 0),
        r.lineTo(0, -e * 0.65),
        r.stroke(),
        r.restore(),
        r.save(),
        r.rotate(l),
        (r.lineWidth = 2),
        (r.strokeStyle = o.secondHand),
        r.beginPath(),
        r.moveTo(0, 0),
        r.lineTo(0, -e * 0.75),
        r.stroke(),
        r.restore());
    },
    W4 = X3;
  var J3 = (e, t) => {
      let { gameBoardContext: o } = c;
      (o.save(),
        o.beginPath(),
        (o.fillStyle = t.secondHand),
        o.arc(0, 0, Math.floor(e * 0.05), 0, Math.PI * 2),
        o.fill(),
        o.restore());
    },
    U4 = J3;
  var Z3 = (e) => {
      let { gameBoard: t, gameBoardContext: o } = c,
        { width: r, height: i } = t,
        s = e || new Date(),
        l = s.getHours(),
        m = I4(s),
        h = r / 2,
        a = i / 2.2,
        d = Math.floor(r * 0.3),
        p;
      (l >= 0 && l <= 5
        ? (p = r1.Orange)
        : l > 5 && l <= 11
          ? (p = r1.White)
          : l > 11 && l <= 17
            ? (p = r1.Teal)
            : (p = r1.Green),
        o.save(),
        o.translate(h, a),
        (o.lineCap = 'round'),
        D4(d, p),
        N4(),
        F4(d, p),
        W4(d, m, p),
        U4(d, p),
        o.restore());
    },
    $4 = Z3;
  var { RGBA_TEAL: T } = f,
    e5 = {
      zi: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-431.157895 188.631579v-215.578947h269.473685v-53.894737H538.947368v-39.585684c26.543158-18.081684 94.585263-65.050947 177.852632-127.488L700.631579 215.578947H323.368421v53.894737h295.316211a4221.008842 4221.008842 0 0 1-121.640421 85.369263l-11.991579 8.003369V431.157895H242.526316v53.894737h242.526316v215.578947c0 48.343579-13.850947 53.894737-134.736843 53.894737v53.894737c105.391158 0 188.631579 0 188.631579-107.789474z" fill="${T}" /></svg>`,
      chou: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-161.68421 188.631579h-159.555369c13.985684-172.813474 43.115789-357.429895 70.817684-385.158737L700.631579 269.473684H323.368421v53.894737h107.169684c-1.940211 45.756632-8.192 103.962947-15.76421 161.684211H323.368421v53.894736h83.968c-9.862737 68.446316-20.264421 130.128842-25.734737 161.684211H215.578947v53.894737h592.842106v-53.894737z m-346.543158-161.684211h149.800421a3313.717895 3313.717895 0 0 0-16.842105 161.684211h-158.477474c6.036211-35.247158 16.114526-95.636211 25.519158-161.684211z m22.608842-215.578947h171.735579c-15.198316 41.121684-27.405474 100.594526-36.890948 161.684211h-150.123789c7.383579-57.505684 13.419789-115.361684 15.279158-161.684211z" fill="${T}" /></svg>`,
      yin: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-257.42821 299.250526l-107.789474-53.894737-24.117895 48.208843 107.789474 53.894736 24.117895-48.208842z m-269.473685-5.658947l-24.117894-48.208842-107.789474 53.894737 24.117895 48.208842 107.789473-53.894737zM700.631579 431.157895h-161.684211v-53.894737h107.789474v-53.894737H377.263158v53.894737h107.789474v53.894737h-161.684211v323.368421h53.894737v-53.894737h269.473684v53.894737h53.894737V431.157895z m-161.684211 161.68421h107.789474v53.894737h-107.789474v-53.894737z m-161.68421 0h107.789474v53.894737h-107.789474v-53.894737z m161.68421-107.789473h107.789474v53.894736h-107.789474v-53.894736z m-161.68421 0h107.789474v53.894736h-107.789474v-53.894736zM754.526316 215.578947h-223.097263l-20.803369-62.410105-51.119158 17.057684L474.624 215.578947H269.473684v107.789474h53.894737v-53.894737h377.263158v53.894737h53.894737V215.578947z" fill="${T}" /></svg>`,
      mao: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-377.263158-188.631579h107.789474v323.368421c-20.48 0-39.936-11.264-40.016842-11.317895l-27.728842 46.214737c3.206737 1.940211 32.660211 18.997895 67.745684 18.997895 30.746947 0 53.894737-23.147789 53.894737-53.894737V269.473684h-215.578948v538.947369h53.894737V323.368421z m-107.789473 242.526316v-242.526316h-53.894737v196.904421l-107.789474 40.421053v-243.927579l169.094737-48.316632-14.821053-51.819789L269.473684 276.102737v304.801684l-36.405895 13.662316 18.917053 50.472421 178.741895-67.018105c-5.039158 69.928421-55.269053 106.981053-165.133474 122.933894l7.733895 53.328842C325.712842 746.657684 485.052632 723.536842 485.052632 565.894737z" fill="${T}" /></svg>`,
      chen: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-498.122105 265.620211L431.157895 754.526316V485.052632h-66.074948c-14.470737 110.645895-44.355368 197.066105-102.696421 260.742736l-39.747368-36.432842C306.526316 617.876211 323.368421 462.901895 323.368421 242.526316V215.578947h377.263158v53.894737H377.182316c-0.404211 58.260211-2.209684 112.128-6.359579 161.684211H700.631579v53.894737h-122.152421a481.172211 481.172211 0 0 0 76.826947 119.70021l66.479158-39.855158 27.728842 46.214737-54.460631 32.687158c29.507368 24.953263 63.757474 45.675789 102.80421 58.098526l-16.303158 51.361684c-134.224842-42.711579-222.773895-167.073684-261.551158-268.207157H485.052632v221.857684l68.985263-41.391158 27.728842 46.214737-109.783579 65.886316zM646.736842 377.263158h-215.578947v-53.894737h215.578947v53.894737z" fill="${T}" /></svg>`,
      si: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-242.041263 180.762947l-52.116211-13.797052C657.219368 749.864421 651.425684 754.526316 619.789474 754.526316h-242.526316V485.052632h269.473684v53.894736h53.894737V215.578947H323.368421v538.947369c0 29.722947 24.171789 53.894737 53.894737 53.894737h242.526316c77.689263 0 91.189895-51.065263 108.274526-115.658106zM377.263158 269.473684h269.473684v161.684211H377.263158v-161.684211z" fill="${T}" /></svg>`,
      wu: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-431.157895 26.947368h269.473685v-53.894736H538.947368v-161.684211h161.684211v-53.894737H411.001263c12.045474-33.28 20.156632-69.793684 20.156632-107.789473h-53.894737c0 121.963789-105.364211 233.391158-106.415158 234.496l38.858105 37.349052c2.883368-3.018105 43.816421-46.133895 77.392842-110.160842H485.052632v161.684211H215.578947v53.894736h269.473685v323.368421h53.894736V538.947368z" fill="${T}" /></svg>`,
      wei: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-431.157895 50.202947c52.304842 70.925474 136.973474 152.144842 232.528843 190.383158l19.994947-50.041263c-109.271579-43.708632-202.805895-152.629895-238.780632-217.49221H808.421053v-53.894737H538.947368v-53.894737h215.578948v-53.894737h-215.578948V161.684211h-53.894736v161.68421h-215.578948v53.894737h215.578948v53.894737H215.578947v53.894737h255.757474c-35.974737 64.862316-129.536 173.783579-238.807579 217.49221l20.021895 50.041263c95.528421-38.238316 180.197053-119.484632 232.501895-190.383158V808.421053h53.894736v-246.218106z" fill="${T}" /></svg>`,
      shen: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-431.157895 134.736842h161.684211v53.894737h53.894737V269.473684h-215.578948V161.684211h-53.894736v107.789473h-215.578948v431.157895h53.894737v-53.894737h161.684211v215.578947h53.894736v-215.578947z m0-161.68421h161.684211v107.789473h-161.684211v-107.789473z m-215.578947 0h161.684211v107.789473h-161.684211v-107.789473z m215.578947-161.684211h161.684211v107.789474h-161.684211v-107.789474z m-215.578947 0h161.684211v107.789474h-161.684211v-107.789474z" fill="${T}" /></svg>`,
      you: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-215.578947-188.631579h-161.684211v-26.947368h161.684211V242.526316H269.473684v53.894737h161.684211v26.947368h-161.684211v485.052632h53.894737v-53.894737h377.263158v53.894737h53.894737V323.368421zM323.368421 646.736842h377.263158v53.894737H323.368421v-53.894737z m0-269.473684h107.789474c0 103.316211-72.784842 107.654737-81.084632 107.789474L350.315789 538.947368c46.592 0 134.736842-33.792 134.736843-161.68421h53.894736v107.789474c0 29.722947 24.171789 53.894737 53.894737 53.894736h107.789474v53.894737H323.368421v-215.578947z m377.263158 0v107.789474h-107.789474v-107.789474h107.789474z m-215.578947-80.842105h53.894736v26.947368h-53.894736v-26.947368z" fill="${T}" /></svg>`,
      xu: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M970.105263 512c0 224.983579-163.166316 412.186947-377.263158 450.533053v-54.460632C777.135158 870.507789 916.210526 707.206737 916.210526 512c0-222.881684-181.328842-404.210526-404.210526-404.210526S107.789474 289.118316 107.789474 512s181.328842 404.210526 404.210526 404.210526c9.081263 0 18.000842-0.754526 26.947368-1.374315v53.894736c-8.973474 0.538947-17.866105 1.374316-26.947368 1.374316-252.604632 0-458.105263-205.500632-458.105263-458.105263S259.395368 53.894737 512 53.894737s458.105263 205.500632 458.105263 458.105263z m-375.592421 150.393263c33.684211 44.544 75.210105 74.698105 124.739369 90.812632l11.425684 3.718737 10.401684-6.009264C781.204211 727.740632 808.421053 622.565053 808.421053 592.842105h-53.894737c0 22.069895-19.132632 80.869053-33.711158 103.504842-34.816-14.605474-64.538947-39.262316-89.249684-74.13221 48.316632-55.269053 92.079158-117.328842 120.535579-179.900632l-49.044211-22.285473c-23.767579 52.250947-59.742316 104.717474-100.055579 152.656842-24.010105-50.930526-41.148632-115.927579-51.658105-195.395369H700.631579v-53.894737h-155.189895A1848.050526 1848.050526 0 0 1 538.947368 161.684211h-53.894736c0 58.206316 2.155789 112.074105 6.494315 161.68421H323.368421v26.947368c0 216.549053-13.177263 263.545263-100.702316 359.046737l39.747369 36.432842c63.326316-69.093053 92.806737-118.272 105.714526-206.848H485.052632v-53.894736h-111.319579a1742.147368 1742.147368 0 0 0 3.449263-107.789474h120.158316c12.611368 98.250105 35.031579 177.475368 67.395368 238.187789-61.978947 65.536-128.053895 117.975579-173.298526 142.282106l25.519158 47.481263c47.589053-25.573053 114.095158-77.446737 177.55621-142.821053z m125.170526-411.971368l-80.842105-80.842106-38.103579 38.103579 80.842105 80.842106 38.103579-38.103579z" fill="${T}" /></svg>`,
      hai: `<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M309.975579 804.756211l-27.136-46.592c103.073684-60.011789 183.026526-132.473263 241.475368-219.24379H350.315789l-13.473684-50.283789c58.88-33.980632 99.435789-117.571368 118.703158-165.295158H242.526316v-53.894737h538.947368v53.894737h-268.18021c-12.395789 34.088421-42.469053 106.603789-90.435369 161.68421h134.009263a680.555789 680.555789 0 0 0 46.349474-107.708631l51.092211 17.057684c-58.421895 175.265684-171.034947 309.490526-344.333474 410.381474z m192.350316-2.937264L467.806316 760.454737c88.414316-73.728 154.516211-158.773895 202.105263-259.907369l48.801684 22.959158a797.372632 797.372632 0 0 1-82.351158 137.781895c32.741053 15.009684 83.456 44.867368 137.647158 101.591579l-38.938947 37.268211c-57.236211-59.877053-109.325474-85.557895-133.766737-95.178106a850.997895 850.997895 0 0 1-98.977684 96.848842z m48.613052-536.872421l-80.842105-53.894737 29.884632-44.840421 80.842105 53.894737-29.884632 44.840421zM512 53.894737C259.395368 53.894737 53.894737 259.395368 53.894737 512s205.500632 458.105263 458.105263 458.105263c9.081263 0 17.973895-0.835368 26.947368-1.374316v-53.894736c-8.946526 0.619789-17.866105 1.374316-26.947368 1.374315-222.881684 0-404.210526-181.328842-404.210526-404.210526S289.118316 107.789474 512 107.789474s404.210526 181.328842 404.210526 404.210526c0 195.206737-139.075368 358.507789-323.368421 396.045474v54.460631c214.096842-38.346105 377.263158-225.549474 377.263158-450.533052C970.105263 259.395368 764.604632 53.894737 512 53.894737z" fill="${T}" /></svg>`,
    },
    q4 = e5;
  var t5 = (e) =>
      [
        'zi',
        'chou',
        'chou',
        'yin',
        'yin',
        'mao',
        'mao',
        'chen',
        'chen',
        'si',
        'si',
        'wu',
        'wu',
        'wei',
        'wei',
        'shen',
        'shen',
        'you',
        'you',
        'xu',
        'xu',
        'hai',
        'hai',
        'zi',
      ][e],
    K4 = t5;
  var o5 = () => {
      let { gameBoard: e, gameBoardContext: t } = c,
        { width: o, height: r } = e,
        s = new Date().getHours(),
        l = K4(s),
        m = L(q4[l]),
        h = Math.floor(o * 0.68),
        a = o / 2 - h,
        d = r / 2 - h * 1.2;
      _(t, m, a, d, h);
    },
    Y4 = o5;
  function r5(e) {
    let { ROWS: t, COLS: o } = y,
      { gameBoardContext: r } = c;
    (B(), k('playing'), Y4());
    for (let i = 0; i < t; i++)
      for (let s = 0; s < o; s++) e[i][s] && j(r, s, i, e[i][s]);
  }
  var j4 = r5;
  var i5 = (e, t, o) => {
      let { gameBoardContext: r } = c,
        { shape: i, color: s } = e,
        { length: l } = i;
      for (let m = 0; m < l; m++)
        for (let h = 0; h < i[m].length; h++) i[m][h] && j(r, t + h, o + m, s);
      return !0;
    },
    Q4 = i5;
  var s5 = (e) => {
      let { board: t, curr: o, cx: r, cy: i } = e;
      (t && j4(t), o && Q4(o, r, i));
    },
    X = s5;
  var c5 = (e) => {
      (B(), X(e), H(), k('paused'), b(), H4(), $4(), B4());
    },
    X4 = c5;
  var n5 = (e) => {
      X4(e);
    },
    J4 = n5;
  var l5 = () => {
      let { RED: e, YELLOW: t } = f,
        { gameBoard: o } = c,
        { width: r, height: i } = o;
      x({
        text: 'GAME',
        x: r / 2,
        y: i / 1.8,
        color: e,
        strokeColor: t,
        size: 2.3,
        center: !0,
        stroke: !0,
      });
    },
    Z4 = l5;
  var a5 = () => {
      let { RED: e, YELLOW: t } = f,
        { gameBoard: o } = c,
        { width: r, height: i } = o;
      x({
        text: 'OVER',
        x: r / 2,
        y: i / 1.6,
        color: e,
        strokeColor: t,
        size: 2.3,
        center: !0,
        stroke: !0,
      });
    },
    e2 = a5;
  var m5 = (e) => {
      (B(), X(e), H(), k('game-over'), b(), Z4(), e2(), u1());
    },
    t2 = m5;
  var h5 = (e) => {
      t2(e);
    },
    o2 = h5;
  var f5 = (e) => {
      (X(e), a1(e));
    },
    r2 = f5;
  var d5 = (e) => {
      r2(e);
    },
    i2 = d5;
  var p5 = {
      'main-menu': (e) => {
        A4(e);
      },
      paused: (e) => {
        J4(e);
      },
      'game-over': (e) => {
        o2(e);
      },
      playing: (e) => {
        i2(e);
      },
    },
    s2 = p5;
  var g5 = (e) => {
      let t = n.getMode(),
        o = s2[t];
      o && o(e);
    },
    c2 = g5;
  var v5 = () => {
      let { ROWS: e, COLS: t } = y,
        { gameBoard: o, nextPiece: r } = c,
        i = globalThis.innerHeight * 0.9;
      ((c.blockSize = Math.floor(i / e)),
        (o.width = c.blockSize * t),
        (o.height = c.blockSize * e),
        (c.fontSize = Math.floor(o.height * 0.032)));
      let s = Math.min(
        globalThis.innerWidth * 0.1,
        globalThis.innerHeight * 0.18,
      );
      ((r.width = s), (r.height = s));
    },
    n2 = v5;
  var u5 = (e) => {
      let { state: t } = n,
        { score: o, lines: r, level: i } = e;
      ((t.score = o), (t.lines = r), Y(i));
    },
    l2 = u5;
  var x5 = () => {
      let { source: e, lines: t, level: o } = n.state;
      return { source: e, lines: t, level: o };
    },
    a2 = x5;
  var W = {
      rafId: null,
      accumulator: 0,
      lastTimestamp: 0,
      state: w,
      resetBoard: t1,
      getMode: E4,
      setMode: e1,
      loadHighScore: T1,
      saveHighScore: L4,
      setLevel: Y,
      setHud: l2,
      getHud: a2,
      launch: () => {
        let { state: e } = W;
        (t1(),
          T1(),
          e1('main-menu'),
          W.setHud({ score: 0, lines: 0, level: 1 }),
          W.resize());
        let { score: t, lines: o, level: r, highScore: i } = e;
        (F(t, o, r, i), O4(e), C4(), W.start());
      },
      start: () => {
        W.rafId = requestAnimationFrame(h1);
      },
      stop: () => {
        v4();
      },
      restart: () => {
        m1();
      },
      render: () => {
        c2(W.state);
      },
      update: (e) => {
        O1(e);
      },
      animate: () => {
        A1();
      },
      resize: () => {
        (n2(), W.render());
      },
    },
    n = W;
  var w5 = () => {
      (R1(V), n.launch());
    },
    m2 = w5;
  m2();
})();
//# sourceMappingURL=tetris.js.map
