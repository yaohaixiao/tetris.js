var tetris = (() => {
  // lib/constants/colors.js
  var TEAL = "#00c8ff";
  var RGBA_TEAL = "rgba(0, 200, 255, 0.3)";
  var YELLOW = "#f1fa04";
  var RGBA_YELLOW = "rgba(255, 255, 0, 0.3)";
  var PURPLE = "#d31ac1";
  var RGBA_PURPLE = "rgba(211, 26, 193, 0.3)";
  var BLUE = "#5050ff";
  var RGBA_BLUE = "rgba(80, 80, 255, 0.3)";
  var ORANGE = "#ffa500";
  var RGBA_ORANGE = "rgba(255, 127, 0, 0.3)";
  var GREEN = "#0afa04";
  var DARK_GREEN = "#5c9d31";
  var RGBA_GREEN = "rgba(0, 255, 0, 0.3)";
  var RED = "#ff3b30";
  var RGBA_RED = "rgba(255, 59, 48, 0.3)";
  var CORAL = "#e64a19";
  var RGBA_CORAL = "rgba(230, 74, 25, 0.3)";
  var BLACK = "#444";
  var RGBA_BLACK = "rgba(0, 0, 0, 0.3)";
  var WHITE = "#fff";
  var RGBA_WHITE = "rgba(255, 255, 255, 0.3)";
  var PINK = "#ff4fa3";
  var RGBA_PINK = "rgba(255, 79, 163, 0.3)";
  var VIOLET = "#7b34eb";
  var RGBA_VIOLET = "rgba(123, 52, 235, 0.3)";
  var CYAN = "#0cc0df";
  var RGBA_CYAN = "rgba(12, 192, 223, 0.3)";
  var COLORS = {
    TEAL,
    RGBA_TEAL,
    YELLOW,
    RGBA_YELLOW,
    PURPLE,
    RGBA_PURPLE,
    BLUE,
    RGBA_BLUE,
    ORANGE,
    RGBA_ORANGE,
    GREEN,
    DARK_GREEN,
    RGBA_GREEN,
    RED,
    RGBA_RED,
    CORAL,
    RGBA_CORAL,
    BLACK,
    RGBA_BLACK,
    WHITE,
    RGBA_WHITE,
    PINK,
    RGBA_PINK,
    VIOLET,
    RGBA_VIOLET,
    CYAN,
    RGBA_CYAN
  };
  var colors_default = COLORS;

  // lib/ui/constants/images/scenes-background.js
  var { RGBA_WHITE: RGBA_WHITE2 } = colors_default;
  var ScenesBackground = {
    tetris: `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 512 512"><path d="M16.568 367.165h68.409v68.409H16.568z" style="fill:#f9d84e"/><path d="M16.568 418.472h68.409v17.102H16.568z" style="fill:#ffc20d"/><path d="M16.568 367.165H33.67v68.409H16.568z" style="fill:#ffc20d"/><path d="M84.977 367.165h68.409v68.409H84.977z" style="fill:#f9d84e"/><path d="M84.977 418.472h68.409v17.102H84.977z" style="fill:#ffc20d"/><path d="M84.977 367.165h17.102v68.409H84.977z" style="fill:#ffc20d"/><path d="M84.977 298.756h68.409v68.409H84.977z" style="fill:#f9d84e"/><path d="M84.977 350.063h68.409v17.102H84.977z" style="fill:#ffc20d"/><path d="M84.977 298.756h17.102v68.409H84.977z" style="fill:#ffc20d"/><path d="M16.568 298.756h68.409v68.409H16.568z" style="fill:#f9d84e"/><path d="M16.568 350.063h68.409v17.102H16.568z" style="fill:#ffc20d"/><path d="M16.568 298.756H33.67v68.409H16.568z" style="fill:#ffc20d"/><path d="M16.568 435.574h68.409v68.409H16.568z" style="fill:#b169bf"/><path d="M16.568 435.574H33.67v68.409H16.568z" style="fill:#844a8f"/><path d="M16.568 486.881h68.409v17.102H16.568z" style="fill:#844a8f"/><path d="M16.568 486.881H33.67v17.102H16.568z" style="fill:#844a8f"/><path d="M84.977 435.574h68.409v68.409H84.977z" style="fill:#b169bf"/><path d="M84.977 435.574h17.102v68.409H84.977z" style="fill:#844a8f"/><path d="M84.977 486.881h68.409v17.102H84.977z" style="fill:#844a8f"/><path d="M84.977 486.881h17.102v17.102H84.977z" style="fill:#844a8f"/><path d="M153.386 435.574h68.409v68.409h-68.409z" style="fill:#b169bf"/><path d="M153.386 435.574h17.102v68.409h-17.102z" style="fill:#844a8f"/><path d="M153.386 486.881h68.409v17.102h-68.409z" style="fill:#844a8f"/><path d="M153.386 486.881h17.102v17.102h-17.102z" style="fill:#844a8f"/><path d="M221.795 435.574h68.409v68.409h-68.409z" style="fill:#b169bf"/><path d="M221.795 435.574h17.102v68.409h-17.102z" style="fill:#844a8f"/><path d="M221.795 486.881h68.409v17.102h-68.409z" style="fill:#844a8f"/><path d="M221.795 486.881h17.102v17.102h-17.102z" style="fill:#844a8f"/><path d="M221.795 367.165h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M221.795 418.472h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M221.795 367.165h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M290.205 367.165h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M290.205 418.472h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M290.205 367.165h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M290.205 435.574h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M290.205 486.881h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M290.205 435.574h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M358.614 435.574h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M358.614 486.881h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M358.614 435.574h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M256 8.017h68.409v68.409H256z" style="fill:#fd5e95"/><path d="M256 59.324h68.409v17.102H256z" style="fill:#d14d7b"/><path d="M256 8.017h17.102v68.409H256z" style="fill:#d14d7b"/><path d="M324.409 8.017h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M324.409 59.324h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M324.409 8.017h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M324.409 76.426h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M324.409 127.733h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M324.409 76.426h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M392.818 76.426h68.409v68.409h-68.409z" style="fill:#fd5e95"/><path d="M392.818 127.733h68.409v17.102h-68.409z" style="fill:#d14d7b"/><path d="M392.818 76.426h17.102v68.409h-17.102z" style="fill:#d14d7b"/><path d="M358.614 367.165h68.409v68.409h-68.409z" style="fill:#7dbb34"/><path d="M358.614 418.472h68.409v17.102h-68.409z" style="fill:#60a333"/><path d="M358.614 367.165h17.102v68.409h-17.102z" style="fill:#60a333"/><path d="M427.023 367.165h68.409v68.409h-68.409z" style="fill:#7dbb34"/><path d="M427.023 418.472h68.409v17.102h-68.409z" style="fill:#60a333"/><path d="M427.023 367.165h17.102v68.409h-17.102z" style="fill:#60a333"/><path d="M427.023 435.574h68.409v68.409h-68.409z" style="fill:#7dbb34"/><path d="M427.023 486.881h68.409v17.102h-68.409z" style="fill:#60a333"/><path d="M427.023 435.574h17.102v68.409h-17.102z" style="fill:#60a333"/><path d="M358.614 298.756h68.409v68.409h-68.409z" style="fill:#7dbb34"/><path d="M358.614 350.063h68.409v17.102h-68.409z" style="fill:#60a333"/><path d="M358.614 298.756h17.102v68.409h-17.102z" style="fill:#60a333"/><path d="M153.386 127.733h68.409v68.409h-68.409z" style="fill:#45cae0"/><path d="M153.386 179.04h68.409v17.102h-68.409z" style="fill:#0aadbf"/><path d="M153.386 127.733h17.102v68.409h-17.102z" style="fill:#0aadbf"/><path d="M153.386 196.142h68.409v68.409h-68.409z" style="fill:#45cae0"/><path d="M153.386 247.449h68.409v17.102h-68.409z" style="fill:#0aadbf"/><path d="M153.386 196.142h17.102v68.409h-17.102z" style="fill:#0aadbf"/><path d="M221.795 196.142h68.409v68.409h-68.409z" style="fill:#45cae0"/><path d="M221.795 247.449h68.409v17.102h-68.409z" style="fill:#0aadbf"/><path d="M221.795 196.142h17.102v68.409h-17.102z" style="fill:#0aadbf"/><path d="M153.386 264.551h68.409v68.409h-68.409z" style="fill:#45cae0"/><path d="M153.386 315.858h68.409v17.102h-68.409z" style="fill:#0aadbf"/><path d="M153.386 264.551h17.102v68.409h-17.102z" style="fill:#0aadbf"/><path d="M256 84.443h60.392v60.392a8.016 8.016 0 0 0 8.017 8.017h136.818a8.016 8.016 0 0 0 8.017-8.017V76.426a8.016 8.016 0 0 0-8.017-8.017h-60.392V8.017A8.016 8.016 0 0 0 392.818 0H256a8.017 8.017 0 0 0-8.017 8.017v68.409A8.017 8.017 0 0 0 256 84.443m76.426 0h52.376v52.376h-52.376zm120.785 52.375h-52.376V84.443h52.376zm-68.409-68.409h-52.376V16.033h52.376zM264.017 16.033h52.376v52.376h-52.376zM495.432 359.148H435.04v-60.392a8.016 8.016 0 0 0-8.017-8.017h-68.409a8.016 8.016 0 0 0-8.017 8.017v60.392h-9.086a8.016 8.016 0 0 0-8.017 8.017 8.016 8.016 0 0 0 8.017 8.017h9.086v52.376h-52.376v-52.376h9.086a8.016 8.016 0 0 0 8.017-8.017 8.016 8.016 0 0 0-8.017-8.017h-85.511a8.017 8.017 0 0 0-8.017 8.017v60.392h-52.376v-86.58h60.392a8.017 8.017 0 0 0 8.017-8.017v-60.392h60.392a8.016 8.016 0 0 0 8.017-8.017v-68.409a8.016 8.016 0 0 0-8.017-8.017h-60.392v-60.392a8.017 8.017 0 0 0-8.017-8.017h-68.409a8.017 8.017 0 0 0-8.017 8.017v17.102a8.017 8.017 0 0 0 8.017 8.017 8.017 8.017 0 0 0 8.017-8.017v-9.086h52.376v52.376h-52.376v-9.086a8.017 8.017 0 0 0-8.017-8.017 8.017 8.017 0 0 0-8.017 8.017v111.699H67.875c-4.427 0-8.017 3.588-8.017 8.017s3.589 8.017 8.017 8.017h9.086v52.376H24.585v-52.376h9.086c4.427 0 8.017-3.588 8.017-8.017s-3.589-8.017-8.017-8.017H16.568a8.017 8.017 0 0 0-8.017 8.017v205.228A8.017 8.017 0 0 0 16.568 512h478.864a8.016 8.016 0 0 0 8.017-8.017V367.165a8.016 8.016 0 0 0-8.017-8.017m-8.017 68.409H435.04v-52.376h52.376zM366.63 375.182h52.376v52.376H366.63zm0-68.41h52.376v52.376H366.63zm-136.818 68.41h52.376v52.376h-52.376zm-136.818 0h52.376v52.376H92.994zm120.785-50.238h-52.376v-52.376h52.376zm68.409-68.41h-52.376v-52.376h52.376zm-68.409-52.375v52.376h-52.376v-52.376zM145.37 359.148H92.994v-52.376h52.376zm-68.41 16.034v52.376H24.585v-52.376zm-52.375 68.409H76.96v52.376H24.585zm68.409 0h52.376v52.376H92.994zm68.409 0h52.376v52.376h-52.376zm68.409 0h52.376v52.376h-52.376zm68.409 0h52.376v52.376h-52.376zm68.409 0h52.376v52.376H366.63zm120.785 52.376H435.04v-52.376h52.376z"/></svg>`,
    gamepad: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" fill="none" viewBox="0 0 48 48"><path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M19 30v3a7 7 0 0 1-7 7v0a7 7 0 0 1-7-7V19M29 30v3a7 7 0 0 0 7 7v0a7 7 0 0 0 7-7V19"/><rect width="38" height="22" x="5" y="8" fill="#2f88ff" stroke="#000" stroke-width="4" rx="11"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M21 19h-8M17 15v8"/><rect width="4" height="4" x="32" y="15" fill="#fff" rx="2"/><rect width="4" height="4" x="28" y="20" fill="#fff" rx="2"/></svg>`,
    tower: `<svg fill="${RGBA_WHITE2}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="800" height="800" viewBox="0 0 512 512"><path d="M341.512 495.967h-11.975l-33.221-71.978c6.644-8.584 10.613-19.341 10.613-31.012 0-18.862-10.346-35.341-25.653-44.095v-134.14c15.308-8.754 25.653-25.234 25.653-44.095 0-25.268-18.556-46.278-42.756-50.133v-11.736c9.93-3.354 17.102-12.752 17.102-23.8s-7.172-20.446-17.102-23.8V8.017a8.017 8.017 0 0 0-16.034 0v53.16c-9.93 3.354-17.102 12.752-17.102 23.8s7.172 20.446 17.102 23.8v11.736c-24.2 3.855-42.756 24.866-42.756 50.133 0 18.862 10.346 35.341 25.653 44.095V348.88c-15.308 8.754-25.653 25.234-25.653 44.095 0 11.555 3.888 22.215 10.414 30.757l-33.337 72.234h-11.975a8.017 8.017 0 0 0-8.017 8.017 8.017 8.017 0 0 0 8.017 8.017h171.026a8.017 8.017 0 0 0 8.017-8.017 8.014 8.014 0 0 0-8.016-8.016m-94.44-410.99c0-5.01 4.076-9.086 9.086-9.086s9.086 4.076 9.086 9.086-4.076 9.086-9.086 9.086-9.086-4.076-9.086-9.086m-24.485 94.597a34.7 34.7 0 0 1-1.168-8.927c0-19.155 15.584-34.739 34.739-34.739s34.739 15.584 34.739 34.739a34.6 34.6 0 0 1-1.168 8.927zm24.485 128.267V289.67h18.171v18.171zm18.171 16.034v19.16a51 51 0 0 0-9.086-.831 51 51 0 0 0-9.086.831v-19.16zm-18.171-50.238v-18.171h18.171v18.171zm0-34.205v-18.844a51 51 0 0 0 9.086.831 51 51 0 0 0 9.086-.831v18.844zm9.085-34.046c-9.366 0-17.87-3.732-24.124-9.778h48.249c-6.255 6.046-14.76 9.778-24.125 9.778m.001 152.852c16.412 0 30.192 11.444 33.806 26.767h-67.611c3.613-15.324 17.393-26.767 33.805-26.767m-25.12 137.729h-30.919l28.008-60.684c.947.63 1.921 1.223 2.911 1.789zm34.205 0h-18.171v-18.171h18.171zm0-34.205h-18.171v-18.844a51 51 0 0 0 9.086.831 51 51 0 0 0 9.086-.831v18.844zm-9.085-34.046c-16.524 0-30.381-11.601-33.879-27.084h67.757c-3.497 15.483-17.354 27.084-33.878 27.084m25.119 68.251v-58.895a50 50 0 0 0 2.667-1.633l27.936 60.528z"/></svg>`,
    pagoda: `<svg fill="${RGBA_WHITE2}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 286.154 286.154"><path d="M230.769 258.462h-23.077V230.77h9.231c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 4.269-8.788 4.602-8.82 4.638-.323-.069-8.548-2.091-24.263-25.662l-1.371-2.054H180V180h13.846c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 4.302-8.917 4.606-8.917 4.629-.226-.037-7.818-1.491-19.431-20.852l-1.348-2.238h-2.612v-9.231h23.077c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 4.302-8.917 4.606-8.917 4.629-.226-.037-7.818-1.491-19.431-20.852l-1.348-2.238h-2.612v-9.231h23.077c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 4.302-8.917 4.606-8.917 4.629-.226-.037-7.818-1.491-19.431-20.852l-1.348-2.238h-2.612v-9.231h18.461c6.383 0 18.462-2.894 18.462-13.846h-9.231c0 3.475-5.82 4.338-8.215 4.551-5.035-2.695-27-15.115-42.554-33.923V0h-9.231v12.166c-15.554 18.808-37.514 31.223-42.549 33.923-2.409-.212-8.22-1.08-8.22-4.551h-9.231c0 10.952 12.078 13.846 18.462 13.846h18.461v9.231h-2.612l-1.343 2.238c-11.667 19.445-19.274 20.83-19.107 20.839-.226-.005-9.245-.286-9.245-4.615h-9.231c0 10.952 12.078 13.846 18.462 13.846h23.077v9.231h-2.612l-1.343 2.238c-11.668 19.445-19.274 20.829-19.108 20.838-.226-.005-9.245-.286-9.245-4.615h-9.231c0 10.952 12.078 13.846 18.462 13.846h23.077v9.231h-2.612l-1.343 2.238c-11.668 19.445-19.274 20.829-19.108 20.838-.226-.005-9.245-.286-9.245-4.615h-9.231c0 10.952 12.078 13.846 18.462 13.846h13.846v13.846h-11.7l-1.371 2.054c-15.812 23.718-24.042 25.615-23.848 25.638-.305-.009-9.235-.309-9.235-4.615h-9.231c0 10.952 12.078 13.846 18.462 13.846h9.231v27.692H55.385v18.462H4.615v9.231h258.462v-9.231h-32.308zm-43.989-55.386c5.806 8.498 10.763 14.364 14.912 18.462h-23.455l-9.231-18.462zm11.682 27.694v27.692h-23.077V230.77zm-80.225-9.231 9.231-18.462h31.218l9.231 18.462zm47.917 9.23v27.692H120v-27.692zm-18.461-36.923v-9.231h-9.231v9.231h-23.077V180h55.385v13.846zm-34.03-147.692c8.686-5.792 19.809-14.303 29.414-25.145 9.605 10.842 20.728 19.352 29.414 25.145zM138.461 60v4.615h-13.846v-9.23h36.923v9.231h-13.846V60zm-30.983 27.692c3.153-3.304 6.67-7.749 10.491-13.846h50.215c3.822 6.097 7.338 10.542 10.486 13.846zm30.983 13.847v4.615h-13.846v-9.231h36.923v9.231h-13.846v-4.615zm-30.983 27.692c3.153-3.305 6.67-7.749 10.491-13.846h50.215c3.822 6.097 7.338 10.542 10.486 13.846zm30.983 13.847v4.615h-13.846v-9.231h36.923v9.231h-13.846v-4.615zm-20.492 13.845h50.215c3.822 6.097 7.338 10.542 10.486 13.846h-71.192c3.153-3.304 6.67-7.749 10.491-13.846m-18.595 46.154h17.774l-9.231 18.462H84.462c4.149-4.099 9.106-9.965 14.912-18.462m11.395 27.692v27.692H87.692v-27.692zm110.769 46.154H64.615v-9.231h156.923z"/><path d="M129.231 240h9.231v9.231h-9.231zM92.308 240h9.231v9.231h-9.231zM184.615 240h9.231v9.231h-9.231zM147.692 240h9.231v9.231h-9.231zM272.308 276.923h9.231v9.231h-9.231z"/></svg>`,
    temple: `<svg fill="${RGBA_WHITE2}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 286.154 286.154"><path d="M263.077 258.462V240h-27.692v-55.385h23.077l1.265-9.051c-.305-.092-30.388-8.885-56.649-30.097v-11.622h46.154l1.117-9.092c-.351-.088-34.735-8.894-61.117-30.069V83.077h18.462l1.874-8.834c-.388-.175-37.68-17.026-56.022-41.751l7.288-11.575.471-.997c.258-.762 2.363-7.606-1.805-13.38C156.443 2.294 151.085 0 143.589 0h-.512c-7.495.097-12.849 2.294-15.905 6.54-4.163 5.774-2.058 12.618-1.805 13.38l7.532 12.175c-18.235 24.942-55.925 41.972-56.317 42.148l1.878 8.834h18.462v11.608c-26.331 21.129-60.771 29.982-61.122 30.069l1.122 9.092h46.154v11.622c-26.202 21.162-56.345 30.009-56.654 30.097l1.269 9.051h23.077V240H23.077v18.462H0v27.692h286.154v-27.692zM134.658 11.94c1.237-1.712 4.311-2.672 8.677-2.709 4.334.037 7.403.983 8.649 2.677 1.145 1.546.84 3.798.655 4.703l-6.983 11.082h-4.643l-6.983-11.095c-.193-.896-.488-3.103.628-4.658m6.222 24.983h4.389c11.598 16.205 30.143 29.022 43.671 36.923H97.214c13.523-7.901 32.072-20.718 43.666-36.923M180 83.077v9.231h-73.846v-9.231zM63.974 124.615c12.009-5.155 26.409-12.692 39.217-23.077h79.768c12.808 10.385 27.212 17.922 39.217 23.077zm129.872 9.231v9.231h-27.692v-9.231zm-36.923 0v9.231h-32.308v-9.231zm-41.538 0v9.231H92.308v-9.231zm-26.04 18.462h107.46c12.748 10.385 26.225 17.922 37.209 23.077H52.14c10.985-5.156 24.462-12.693 37.205-23.077m127.578 41.538v-9.231h9.231v9.231zm9.231 9.231V240h-9.231v-36.923zm-32.308 9.231V240h-4.615v-36.923h18.462V240h-4.616v-27.692zm-4.615-18.462v-9.231h18.462v9.231zm-18.462 0v-9.231H180v9.231zm9.231 9.231V240h-9.231v-36.923zm-64.615 0V240h-9.231v-36.923zm-9.231-9.231v-9.231h9.231v9.231zm9.23 55.385h55.385v9.231h-55.385zm13.847-36.923V240h-4.615v-36.923h36.923V240h-4.615v-27.692zm18.461 9.23V240h-9.231v-18.462zm13.846-27.692h-36.923v-9.231h36.923zm-78.461 18.462V240h-4.615v-36.923h18.462V240h-4.615v-27.692zm-4.615-18.462v-9.231h18.461v9.231zm-18.462 0v-9.231h9.231v9.231zm9.231 9.231V240H60v-36.923zm-36.923 46.154h73.847v9.231H32.308zm64.615 27.692H9.231v-9.231h87.692zm83.077 0h-73.846v-9.231H180zm0-27.692h73.846v9.231H180zm96.923 27.692h-87.692v-9.231h87.692z"/><path d="M96.923 110.769h9.231V120h-9.231zM115.385 110.769h9.231V120h-9.231zM133.846 110.769h9.231V120h-9.231zM189.231 161.538h9.231v9.231h-9.231zM124.615 60h9.231v9.231h-9.231z"/></svg>`,
    coffee: `<svg fill="${RGBA_WHITE2}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="800" height="800" viewBox="0 0 32 32"><path d="M24.6 25h.9c2.5 0 4.5-2 4.5-4.5 0-2.3-1.8-4.2-4-4.4V15c0-.6-.4-1-1-1H7c-.6 0-1 .4-1 1v5c0 3.3 1.6 6.2 4 8H5c-.6 0-1 .4-1 1s.4 1 1 1h22c.6 0 1-.4 1-1s-.4-1-1-1h-5c1.1-.8 2-1.8 2.6-3m3.4-4.5c0 1.4-1.1 2.5-2.5 2.5.3-.9.5-2 .5-3v-1.9c1.1.2 2 1.2 2 2.4M24 16v2.4c-1.1.5-4.1 1.4-7.6-.3s-6.6-.8-8.4.1V16zM8 20.5c1-.7 4-2.3 7.5-.6 1.8.9 3.5 1.1 5 1.1 1.4 0 2.6-.3 3.5-.5-.1 1-.3 2-.7 2.8-.1.1-.2.3-.2.4-1.4 2.5-4 4.2-7 4.2-4.3.1-7.8-3.2-8.1-7.4m3-9.5h3c.3 0 .5.2.5.5v.5c0 .6.4 1 1 1s1-.4 1-1v-.5c0-1.4-1.1-2.5-2.5-2.5h-3c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h9.5c1.7 0 3-1.3 3-3s-1.3-3-3-3h-10c-.6 0-1 .4-1 1s.4 1 1 1h10c.6 0 1 .4 1 1s-.4 1-1 1H11C9.6 6 8.5 7.1 8.5 8.5S9.6 11 11 11"/></svg>`,
    happy: `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="800" height="800" viewBox="0 0 512.003 512.003"><circle cx="256.001" cy="256.001" r="256.001" style="fill:#fddf6d"/><path d="M310.859 474.208c-141.385 0-256-114.615-256-256 0-75.537 32.722-143.422 84.757-190.281C56.738 70.303 0 156.525 0 256c0 141.385 114.615 256 256 256 65.849 0 125.883-24.87 171.243-65.718-34.918 17.853-74.473 27.926-116.384 27.926" style="fill:#fcc56b"/><path d="M245.899 187.172c-5.752 0-10.414-4.663-10.414-10.414 0-13.433-10.928-24.362-24.362-24.362s-24.362 10.93-24.362 24.362c0 5.752-4.663 10.414-10.414 10.414-5.752 0-10.414-4.663-10.414-10.414 0-24.918 20.273-45.19 45.19-45.19s45.19 20.272 45.19 45.19c.001 5.751-4.662 10.414-10.414 10.414M421.798 187.172c-5.752 0-10.414-4.663-10.414-10.414 0-13.433-10.928-24.362-24.362-24.362s-24.362 10.93-24.362 24.362c0 5.752-4.663 10.414-10.414 10.414s-10.414-4.663-10.414-10.414c0-24.918 20.273-45.19 45.19-45.19s45.19 20.272 45.19 45.19c.001 5.751-4.662 10.414-10.414 10.414" style="fill:#7f184c"/><path d="M293.248 443.08c-74.004 0-133.995-59.991-133.995-133.995h267.991c-.001 74.003-59.993 133.995-133.996 133.995" style="fill:#fff"/><path d="M172.426 367.092a134 134 0 0 0 12.472 20.829h216.699a134 134 0 0 0 12.472-20.829z" style="fill:#e6e6e6"/><path d="M145.987 240.152c-19.011 0-34.423 15.412-34.423 34.423h68.848c-.002-19.011-15.414-34.423-34.425-34.423M446.251 240.152c-19.011 0-34.423 15.412-34.423 34.423h68.848c0-19.011-15.412-34.423-34.425-34.423" style="fill:#f9a880"/><ellipse cx="292.913" cy="73.351" rx="29.854" ry="53.46" style="fill:#fceb88" transform="rotate(-74.199 292.913 73.351)"/></svg>`
  };
  var scenes_background_default = ScenesBackground;

  // lib/engine/state/engine-state.js
  var EngineState = {
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
    /*
     * main-menu：等级选择（主菜单）
     * playing：游戏中
     * paused：游戏暂停
     * game-over：游戏结束
     */
    mode: "main-menu"
  };
  var engine_state_default = EngineState;

  // lib/engine/replay.js
  var Replay = {
    /**
     * ## 是否正在录制
     *
     * @type {boolean}
     */
    recording: false,
    /**
     * ## 是否正在播放
     *
     * @type {boolean}
     */
    playing: false,
    /**
     * ## 当前帧计数（用于标记时间轴）
     *
     * @type {number}
     */
    frame: 0,
    /**
     * ## 录制的数据列表：
     *
     * 一般结构类似：[{ frame: number, command: Command }]
     *
     * @type {Array}
     */
    data: [],
    /**
     * ## 播放游标（当前播放到 data 的位置）
     *
     * @type {number}
     */
    cursor: 0,
    /**
     * ## 开始录制
     *
     * 行为：
     *
     * - 打开 recording 状态
     * - 清空已有数据
     * - 重置 frame
     */
    startRecord() {
      this.recording = true;
      this.data = [];
      this.frame = 0;
    },
    /** ## 停止录制 */
    stopRecord() {
      this.recording = false;
    },
    /**
     * ## 开始播放
     *
     * 行为：
     *
     * - 打开 playing 状态
     * - 重置 frame
     * - 重置 cursor
     */
    startPlay() {
      this.playing = true;
      this.frame = 0;
      this.cursor = 0;
    },
    /** ## 停止播放 */
    stopPlay() {
      this.playing = false;
    }
  };
  var replay_default = Replay;

  // lib/command/command-queue.js
  var CommandQueue = {
    /**
     * ## 命令队列（FIFO）
     *
     * @type {object[]}
     */
    queue: [],
    /**
     * ## 入队一个 Command
     *
     * @param {object} command - 要执行的命令
     */
    enqueue(command) {
      this.queue.push(command);
    },
    /**
     * ## 执行并清空队列中的所有 Command
     *
     * 当前行为：
     *
     * - 一次性执行全部 command
     * - 不做时间分帧控制
     *
     * @param {object} engine - 游戏引擎实例
     */
    flush(engine) {
      const { queue } = this;
      while (queue.length > 0) {
        const cmd = queue.shift();
        cmd.execute(engine);
      }
    },
    /** ## 清空队列（丢弃所有未执行命令） */
    clear() {
      this.queue.length = 0;
    }
  };
  var command_queue_default = CommandQueue;

  // lib/animations/animations-system.js
  var animations = [];
  var registerAnimation = (animation2) => {
    animations.push(animation2);
  };
  var updateAnimations = (delta) => {
    for (let i = animations.length - 1; i >= 0; i--) {
      const anim = animations[i];
      const active = anim.update(delta);
      if (!active) {
        animations.splice(i, 1);
      }
    }
  };
  var renderAnimations = () => {
    const sorted = animations.slice().toSorted((a, b) => a.layer - b.layer);
    for (const animation2 of sorted) {
      animation2.render();
    }
  };
  var hasBlockingAnimation = (names = []) => animations.some((animation2) => {
    const isBlocking = animation2.blocking;
    return names && names.length > 0 ? isBlocking && names.includes(animation2.name) : isBlocking;
  });

  // lib/audio/play-tone.js
  var audioCtx = new AudioContext();
  var playTone = (freq, dur, vol = 0.1, wave = "square") => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    const now = audioCtx.currentTime;
    const durationInSeconds = dur / 1e3;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(1e-4, durationInSeconds);
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + durationInSeconds);
    osc.addEventListener("ended", () => {
      osc.disconnect();
      gain.disconnect();
    });
  };
  var play_tone_default = playTone;

  // lib/audio/sounds.js
  var MOTIFS = {
    combo: {
      shift: 0,
      speed: 1,
      volume: 1
    },
    tetris: {
      shift: 2,
      speed: 1.2,
      volume: 1.1
    },
    perfect: {
      shift: 5,
      speed: 0.9,
      volume: 1.3
    }
  };
  var getMotif = (lines, isPerfectClear = false) => {
    if (isPerfectClear) return "perfect";
    if (lines === 4) return "tetris";
    return "combo";
  };
  var Sounds = {
    // 等级选择音效（正弦波柔和音效）
    levelSelect: () => play_tone_default(523, 80, 0.1, "sine"),
    // 等级开始音效
    levelStart: () => play_tone_default(1319, 160, 0.22, "sine"),
    // 开始倒计时音效
    countdown: () => play_tone_default(784, 180, 0.3, "sine"),
    // 方块移动音效
    move: () => play_tone_default(330, 60),
    // 方块旋转音效
    rotate: () => play_tone_default(440, 60),
    // 方块快速下落音效
    drop: () => play_tone_default(220, 100),
    // 方块落地音效
    fall: () => play_tone_default(180, 200),
    /**
     * ## 消行动效音播放（基于和弦 + 动机系统）
     *
     * 根据消除行数生成不同音乐动机，并播放对应和弦音效
     *
     * @param {number} lines - 消除行数
     * @param {boolean} isPerfectClear - 是否全清
     */
    clear: (lines = 1, isPerfectClear = false) => {
      const frequencies = [
        [440, 587, 698],
        [587, 698, 880],
        [698, 880, 1174],
        [587, 880, 1174],
        [440, 880, 1174]
      ];
      const speeds = [260, 300, 380];
      const volumes = [0.32, 0.3, 0.25];
      const timeouts = [160, 320, 480];
      const motif = getMotif(lines, isPerfectClear);
      const cfg = MOTIFS[motif];
      const index = Math.min(lines, frequencies.length - 1);
      const baseChord = frequencies[index];
      const chord = baseChord.map((freq) => freq + cfg.shift * 12);
      for (const [i, freq] of chord.entries()) {
        setTimeout(() => {
          play_tone_default(
            freq,
            speeds[i] * cfg.speed,
            volumes[i] * cfg.volume,
            "square"
          );
        }, timeouts[i]);
      }
    },
    // 升级庆祝音效
    levelUp: () => {
      play_tone_default(523, 220);
      setTimeout(() => play_tone_default(587, 220), 260);
      setTimeout(() => play_tone_default(659, 240), 520);
      setTimeout(() => play_tone_default(784, 260), 780);
      setTimeout(() => play_tone_default(880, 280), 1060);
      setTimeout(() => play_tone_default(1047, 320), 1360);
      setTimeout(() => play_tone_default(1175, 360), 1700);
      setTimeout(() => play_tone_default(1319, 480), 2080);
    },
    // 暂停游戏音效
    pause: () => play_tone_default(300, 150),
    // 秒针走动音效
    secondTick: () => play_tone_default(880, 50, 0.085, "sine"),
    // 恢复游戏音效
    resume: () => play_tone_default(400, 150),
    // 游戏结束音效（悲伤旋律）
    gameOver: () => {
      play_tone_default(330, 200);
      setTimeout(() => play_tone_default(294, 300), 210);
      setTimeout(() => play_tone_default(262, 500), 520);
    },
    // 背景音乐开关音效
    bgmToggle: () => play_tone_default(440, 100)
  };
  var sounds_default = Sounds;

  // lib/ui/core/canvas.js
  var gameBoard = document.querySelector("#game-board");
  var gameBoardContext = gameBoard.getContext("2d");
  var nextPiece = document.querySelector("#next-piece");
  var nextPieceContext = nextPiece.getContext("2d");
  var fontSize = 0;
  var blockSize = 0;
  var Canvas = {
    gameBoard,
    gameBoardContext,
    nextPiece,
    nextPieceContext,
    fontSize,
    blockSize
  };
  var canvas_default = Canvas;

  // lib/ui/board/clear-board.js
  function clearBoard() {
    const { gameBoard: gameBoard2, gameBoardContext: gameBoardContext2 } = canvas_default;
    const { width, height } = gameBoard2;
    gameBoardContext2.clearRect(0, 0, width, height);
  }
  var clear_board_default = clearBoard;

  // lib/game/constants/game.js
  var CLEAR_SCORES = [0, 100, 300, 500, 800, 1200];
  var FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;
  var MAX_LEVEL = 99;
  var GAME = {
    CLEAR_SCORES,
    MAX_LEVEL,
    FONT_FAMILY
  };
  var game_default = GAME;

  // lib/ui/text/render-text.js
  var renderText = (options) => {
    const {
      text,
      x,
      y,
      color,
      strokeColor,
      size = 1,
      center = true,
      baseline = "",
      stroke = false,
      lineWidth = 2
    } = options;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const { gameBoardContext: ctx, fontSize: fontSize2 } = canvas_default;
    ctx.save();
    if (center) {
      ctx.textAlign = "center";
    }
    if (baseline) {
      ctx.textBaseline = baseline;
    }
    ctx.font = `${fontSize2 * size}px ${FONT_FAMILY2}`;
    if (stroke) {
      ctx.strokeStyle = strokeColor || color;
      ctx.lineWidth = lineWidth;
      ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };
  var render_text_default = renderText;

  // lib/ui/text/render-tetris-text.js
  var renderTetrisText = () => {
    const { GREEN: GREEN6 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "TETRIS.JS",
      x: width / 2,
      y: height * 0.1,
      color: GREEN6,
      size: 1.1
    });
  };
  var render_tetris_text_default = renderTetrisText;

  // lib/ui/overlay/render-overlay.js
  var renderOverlay = (color) => {
    const { RGBA_BLACK: RGBA_BLACK2 } = colors_default;
    const { gameBoard: gameBoard2, gameBoardContext: ctx } = canvas_default;
    const { width, height } = gameBoard2;
    ctx.save();
    ctx.fillStyle = color || RGBA_BLACK2;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };
  var render_overlay_default = renderOverlay;

  // lib/ui/text/render-countdown-text.js
  var renderCountdownText = (count, scale = 1) => {
    const { YELLOW: YELLOW5, BLACK: BLACK2 } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const { gameBoard: gameBoard2, gameBoardContext: ctx, fontSize: fontSize2 } = canvas_default;
    const { width, height } = gameBoard2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.font = `${fontSize2 * 3.25}px ${FONT_FAMILY2}`;
    ctx.fillStyle = YELLOW5;
    ctx.strokeStyle = BLACK2;
    ctx.lineWidth = 6;
    const text = String(count);
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };
  var render_countdown_text_default = renderCountdownText;

  // lib/ui/text/render-get-ready-text.js
  var renderGetReadyText = () => {
    const { GREEN: GREEN6, BLACK: BLACK2 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "GET READY!",
      x: width / 2,
      y: height / 1.46,
      color: GREEN6,
      stroke: true,
      strokeColor: BLACK2,
      // 固定字号
      size: 1.1,
      center: true,
      // 对齐方式与你原逻辑一致
      baseline: "top"
    });
  };
  var render_get_ready_text_default = renderGetReadyText;

  // lib/ui/image/image-manager.js
  var ImagesCache = /* @__PURE__ */ new Map();
  var toDataURI = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  var getImage = (svg) => {
    const cached = ImagesCache.get(svg);
    if (cached) {
      return cached;
    }
    const img = new Image();
    img.src = toDataURI(svg);
    ImagesCache.set(svg, img);
    return img;
  };
  var clearImagesCache = () => {
    for (const { url } of ImagesCache.values()) {
      URL.revokeObjectURL(url);
    }
    ImagesCache.clear();
  };
  var preloadImages = (images) => {
    const svgs = Object.values(images);
    clearImagesCache();
    for (const svg of svgs) {
      getImage(svg);
    }
  };

  // lib/ui/image/render-image.js
  var renderImage = (ctx, img, x, y, size) => {
    if (!img.complete) {
      return;
    }
    ctx.save();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  };
  var render_image_default = renderImage;

  // lib/ui/image/render-gamepad-image.js
  var renderGamepadImage = () => {
    const { gameBoard: gameBoard2, gameBoardContext: ctx } = canvas_default;
    const { width, height } = gameBoard2;
    const img = getImage(scenes_background_default.gamepad);
    const size = Math.floor(width * 0.54);
    const x = width / 2 - size / 2;
    const y = height / 2 - size * 1.2;
    render_image_default(ctx, img, x, y, size);
  };
  var render_gamepad_image_default = renderGamepadImage;

  // lib/ui/image/render-scene-background.js
  var renderSceneBackground = (scene) => {
    const { gameBoard: gameBoard2, gameBoardContext: ctx } = canvas_default;
    const { width, height } = gameBoard2;
    const hours = (/* @__PURE__ */ new Date()).getHours();
    let icon;
    let img;
    let size;
    let x;
    let y;
    switch (scene) {
      case "main-menu":
      case "countdown": {
        img = getImage(scenes_background_default.tetris);
        size = width;
        x = width / 2 - size / 2;
        y = height - size;
        break;
      }
      case "playing": {
        if (hours >= 0 && hours <= 8) {
          icon = "pagoda";
          size = width * 1.4;
        } else if (hours > 8 && hours <= 14) {
          icon = "temple";
          size = width * 1.1;
        } else {
          icon = "tower";
          size = width * 1.6;
        }
        img = getImage(scenes_background_default[icon]);
        x = width / 2 - size / 2;
        y = height - size;
        break;
      }
      case "paused": {
        img = getImage(scenes_background_default.coffee);
        size = width * 0.76;
        x = width / 2 - size / 2;
        y = height - size * 0.94;
        break;
      }
      case "game-over": {
        img = getImage(scenes_background_default.happy);
        size = Math.floor(width * 0.42);
        x = width / 2 - size / 2;
        y = height / 2 - size * 1.35;
        break;
      }
    }
    render_image_default(ctx, img, x, y, size);
  };
  var render_scene_background_default = renderSceneBackground;

  // lib/ui/effects/render-countdown.js
  var renderCountdown = (state) => {
    const { number, scale } = state;
    clear_board_default();
    render_overlay_default();
    render_tetris_text_default();
    render_scene_background_default("countdown");
    render_gamepad_image_default();
    render_get_ready_text_default();
    render_countdown_text_default(number, scale);
  };
  var render_countdown_default = renderCountdown;

  // lib/engine/state/set-mode.js
  var MODES = /* @__PURE__ */ new Set(["main-menu", "playing", "paused", "game-over"]);
  var setMode = (mode) => {
    if (!MODES.has(mode) || engine_state_default.mode === mode) {
      return;
    }
    engine_state_default.mode = mode;
  };
  var set_mode_default = setMode;

  // lib/audio/state/audio-state.js
  var AudioState = {
    /** 是否启用背景音乐 true = 播放 BGM false = 静音 BGM */
    bgmEnabled: true,
    /**
     * BGM 定时器引用
     *
     * 常见用途：
     *
     * - SetInterval / setTimeout 控制循环播放
     * - 或用于调度下一段 BGM clip
     */
    bgmTimer: null
  };
  var audio_state_default = AudioState;

  // lib/audio/constants/musics.js
  var Musics = {
    TetrisTheme: {
      name: "TetrisTheme",
      melody: [
        // === A段：经典律动 (3-1-1 结构) ===
        659,
        659,
        659,
        494,
        523,
        587,
        587,
        587,
        523,
        494,
        // Mi--- Si-Do- Re--- Do-Si
        440,
        440,
        440,
        523,
        659,
        659,
        659,
        587,
        523,
        // La--- Do-Mi- Re--- Do-Si
        494,
        494,
        494,
        523,
        587,
        587,
        587,
        659,
        // Si--- Do-Re- Mi---
        523,
        523,
        523,
        440,
        440,
        440,
        440,
        // Do--- La---
        // === A'段：高音区 (严格复制开头的 3-1-1 节奏) ===
        587,
        587,
        587,
        784,
        880,
        880,
        880,
        784,
        659,
        // Re--- Sol-La- Sol--- Mi
        523,
        523,
        523,
        659,
        784,
        784,
        784,
        659,
        587,
        // Do--- Mi-Sol- Mi--- Re
        494,
        494,
        494,
        523,
        587,
        587,
        587,
        659,
        // Si--- Do-Re- Mi---
        523,
        523,
        523,
        440,
        440,
        440,
        440,
        // Do--- La---
        // === B段：下行区 (也要用 3-1-1 才能保持顿挫) ===
        659,
        659,
        659,
        523,
        523,
        587,
        587,
        587,
        494,
        494,
        // Mi--- Do-Do Re--- Si-Si
        523,
        523,
        523,
        440,
        440,
        415,
        415,
        415,
        415,
        // Do--- La-La #So---
        659,
        659,
        659,
        523,
        523,
        587,
        587,
        587,
        494,
        494,
        // Mi--- Do-Do Re--- Si-Si
        523,
        523,
        523,
        659,
        659,
        880,
        880,
        880,
        880,
        // Do--- Mi-Mi La---
        // === 结尾收束 (最后的一跺脚) ===
        784,
        784,
        784,
        659,
        587,
        587,
        587,
        523,
        // Sol--- Mi Re--- Do
        494,
        494,
        494,
        523,
        587,
        587,
        587,
        659,
        // Si--- Do Re--- Mi
        523,
        523,
        523,
        440,
        440,
        440,
        440
        // Do--- La---
      ],
      duration: 150,
      volume: 0.08
    },
    Loginska: {
      name: "Loginska",
      melody: [
        // === A段：沉稳推进 ===
        659,
        659,
        659,
        784,
        880,
        784,
        784,
        784,
        659,
        587,
        // Mi--- Sol-La Sol--- Mi-Re
        659,
        659,
        659,
        523,
        587,
        659,
        659,
        659,
        784,
        880,
        // Mi--- Do-Re Mi--- Sol-La
        // === B段：上行高潮 ===
        784,
        784,
        784,
        880,
        988,
        880,
        880,
        880,
        784,
        659,
        // Sol--- La-Si Sol--- La-Mi
        587,
        587,
        587,
        659,
        523,
        587,
        587,
        587,
        659,
        784,
        // Re--- Mi-Do Re--- Mi-Sol
        // === C段：急促下行收束 ===
        784,
        784,
        784,
        659,
        587,
        659,
        659,
        659,
        523,
        494,
        // Sol--- Mi-Re Mi--- Do-Si
        440,
        440,
        440,
        440,
        440,
        440,
        440
        // La-------
      ],
      // 稍微慢一点点，突出沉稳感
      duration: 160,
      volume: 0.07
    },
    Technotris: {
      name: "Technotris",
      melody: [
        // === Intro（电子重复）===
        659,
        659,
        494,
        494,
        523,
        523,
        587,
        587,
        523,
        523,
        494,
        494,
        // === 主旋律A（加倍节奏）===
        659,
        494,
        523,
        587,
        523,
        494,
        440,
        494,
        523,
        587,
        659,
        659,
        659,
        587,
        523,
        494,
        // === 电子重复变体 ===
        523,
        523,
        587,
        587,
        659,
        659,
        784,
        784,
        659,
        659,
        587,
        587,
        // === 上行推进（带tech味）===
        659,
        784,
        880,
        784,
        659,
        587,
        659,
        523,
        587,
        659,
        784,
        880,
        988,
        880,
        784,
        // === 高潮（高频+重复）===
        784,
        880,
        988,
        1175,
        988,
        880,
        784,
        659,
        659,
        659,
        784,
        784,
        880,
        880,
        // === Break（简化节奏）===
        659,
        587,
        523,
        494,
        523,
        587,
        659,
        // === Drop（强化重复节奏）===
        784,
        784,
        880,
        880,
        988,
        988,
        880,
        880,
        784,
        784,
        659,
        659,
        587,
        587,
        523,
        523,
        // === Ending（循环点）===
        494,
        523,
        587,
        659,
        587,
        523,
        494,
        440
      ],
      duration: 150,
      volume: 0.09
    },
    FirstDivision: {
      name: "FirstDivision",
      melody: [
        // === 主动机（进行曲感）===
        523,
        587,
        659,
        587,
        523,
        494,
        523,
        587,
        659,
        // === 重复推进 ===
        659,
        698,
        784,
        698,
        659,
        587,
        659,
        523,
        587,
        // === 第二句（上行）===
        523,
        587,
        659,
        698,
        784,
        698,
        659,
        587,
        523,
        494,
        523,
        // === 强化段（军乐推进）===
        659,
        784,
        880,
        784,
        659,
        587,
        659,
        523,
        587,
        659,
        698,
        784,
        // === 高潮（稳定推进）===
        784,
        880,
        988,
        880,
        784,
        698,
        784,
        659,
        587,
        523,
        587,
        659,
        // === 回落（收束）===
        587,
        523,
        494,
        523,
        587,
        659,
        587,
        523,
        // === 循环点 ===
        494,
        523,
        587,
        523,
        494
      ],
      duration: 180,
      volume: 0.08
    },
    Korobeiniki: {
      name: "Korobeiniki",
      melody: [
        // === A段（经典开头）===
        659,
        494,
        523,
        587,
        523,
        494,
        440,
        494,
        523,
        587,
        659,
        523,
        587,
        659,
        587,
        523,
        494,
        // === A'段（变体）===
        523,
        587,
        659,
        784,
        659,
        587,
        523,
        494,
        523,
        587,
        659,
        587,
        523,
        494,
        // === B段（推进）===
        587,
        659,
        784,
        659,
        587,
        523,
        587,
        659,
        523,
        494,
        659,
        784,
        880,
        784,
        659,
        // === C段（高潮）===
        587,
        659,
        784,
        880,
        784,
        659,
        587,
        523,
        587,
        659,
        784,
        659,
        587,
        523,
        // === D段（变化）===
        523,
        587,
        659,
        784,
        880,
        784,
        659,
        587,
        523,
        494,
        523,
        587,
        659,
        523,
        494,
        // === E段（回落）===
        440,
        494,
        523,
        587,
        523,
        494,
        440,
        494,
        523,
        587,
        659,
        // === F段（再现+收束）===
        659,
        784,
        880,
        784,
        659,
        587,
        659,
        523,
        587,
        659,
        587,
        523,
        494,
        // === 结尾（循环点）===
        523,
        494,
        440
      ],
      duration: 140,
      volume: 0.08
    },
    JourneyToWest: {
      name: "JourneyToWest",
      /*
       * 逻辑说明：
       * 1. 采用 3-1-1 或 2-1-1 的动态长度模拟原曲的“奔跑感”。
       * 2. 核心旋律：La - Do - Re - Mi - La(高) - Sol - Mi - Re
       */
      melody: [
        // === 前奏：标志性的"丢丢丢丢"电子脉冲 ===
        880,
        120,
        880,
        120,
        0,
        60,
        880,
        120,
        880,
        120,
        0,
        60,
        880,
        120,
        880,
        120,
        0,
        60,
        880,
        120,
        880,
        240,
        // === 主旋律：La Do Re Mi ===
        440,
        400,
        440,
        100,
        440,
        300,
        // La (附点节奏)
        523,
        400,
        587,
        400,
        587,
        100,
        87,
        300,
        // Do Re
        659,
        500,
        // Mi
        // === 冲上云霄：高音La Sol Mi ===
        880,
        400,
        880,
        100,
        880,
        300,
        // 高音La
        784,
        400,
        659,
        400,
        659,
        100,
        659,
        300,
        // Sol Mi
        659,
        500,
        // === 转折：Re Do La ===
        587,
        400,
        587,
        100,
        587,
        300,
        // Re
        523,
        400,
        440,
        400,
        440,
        100,
        440,
        300,
        // Do La
        440,
        500,
        // === 燃段：Si La Sol La ===
        587,
        300,
        587,
        200,
        659,
        300,
        784,
        400,
        // Re Mi Sol
        784,
        200,
        784,
        200,
        880,
        400,
        // Sol La
        988,
        300,
        988,
        200,
        988,
        300,
        880,
        400,
        // Si La
        784,
        300,
        784,
        200,
        784,
        400,
        // Sol
        // === 回响：超高音 ===
        1175,
        150,
        1175,
        150,
        0,
        100,
        1175,
        150,
        1175,
        150,
        0,
        100,
        880,
        300,
        880,
        300,
        // === 结尾 ===
        440,
        400,
        440,
        200,
        440,
        400,
        440,
        200,
        440,
        600
      ],
      // 建议：这首歌需要极快的节奏才能带出那个电音味儿
      duration: 110,
      volume: 0.12
    }
  };
  var musics_default = Musics;

  // lib/audio/loop-play-bgm.js
  var loopPlayBGM = (i, m, dur = 110, vol = 0.05) => {
    if (i >= m.length) {
      i = 0;
    }
    play_tone_default(m[i], dur * 0.8, vol);
    audio_state_default.bgmTimer = setTimeout(() => {
      loopPlayBGM(i + 1, m, dur, vol);
    }, dur);
  };
  var loop_play_bgm_default = loopPlayBGM;

  // lib/audio/stop-bgm.js
  var stopBGM = () => {
    if (audio_state_default.bgmTimer) {
      clearTimeout(audio_state_default.bgmTimer);
    }
    audio_state_default.bgmTimer = null;
  };
  var stop_bgm_default = stopBGM;

  // lib/audio/play-bgm.js
  var playBGM = () => {
    let music;
    if (!audio_state_default.bgmEnabled) {
      return false;
    }
    switch (engine_default.state.level) {
      case 1:
      case 2: {
        music = musics_default.TetrisTheme;
        break;
      }
      case 3:
      case 4: {
        music = musics_default.Loginska;
        break;
      }
      case 5:
      case 6: {
        music = musics_default.Technotris;
        break;
      }
      case 7:
      case 8: {
        music = musics_default.FirstDivision;
        break;
      }
      case 9:
      case 10: {
        music = musics_default.Korobeiniki;
        break;
      }
      default: {
        music = musics_default.JourneyToWest;
        break;
      }
    }
    const { melody, duration, volume } = music;
    stop_bgm_default();
    loop_play_bgm_default(0, melody, duration, volume);
  };
  var play_bgm_default = playBGM;

  // lib/ui/constants/board.js
  var COLS = 10;
  var ROWS = 20;
  var BOARD = {
    COLS,
    ROWS
  };
  var board_default = BOARD;

  // lib/ui/constants/tetrominoes.js
  var { PINK: PINK2, BLUE: BLUE2, TEAL: TEAL2, YELLOW: YELLOW2, VIOLET: VIOLET2, ORANGE: ORANGE2, GREEN: GREEN2, RED: RED2 } = colors_default;
  var TETROMINOES = [
    // I型方块（长条）：1行4列
    { shape: [[1, 1, 1, 1]], color: TEAL2 },
    // I型方块（长条）：1行5列
    { shape: [[1, 1, 1, 1, 1]], color: GREEN2 },
    // O型方块（正方形）：2x2
    {
      shape: [
        [1, 1],
        [1, 1]
      ],
      color: ORANGE2
    },
    // T型方块：2x3
    {
      shape: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      color: YELLOW2
    },
    // L型方块
    {
      shape: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      color: BLUE2
    },
    // J型方块
    {
      shape: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      color: PINK2
    },
    // S型方块（右斜）
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      color: RED2
    },
    // Z型方块（左斜）
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      color: VIOLET2
    }
  ];
  var tetrominoes_default = TETROMINOES;

  // lib/game/utils/random-tetromino.js
  function randomTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoes_default.length);
    const piece = tetrominoes_default[randomIndex];
    return {
      ...piece,
      shape: piece.shape.map((row) => [...row])
    };
  }
  var random_tetromino_default = randomTetromino;

  // lib/game/logic/collision.js
  var collision = (ox, oy, state) => {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const { curr, cx, cy, board } = state;
    if (!curr) {
      return false;
    }
    const s = curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          const nx = cx + x + ox;
          const ny = cy + y + oy;
          const outOfBounds = nx < 0 || nx >= COLS2 || ny >= ROWS2;
          const hitBlock = ny >= 0 && ny < ROWS2 && board[ny][nx];
          if (outOfBounds || hitBlock) {
            return true;
          }
        }
      }
    }
    return false;
  };
  var collision_default = collision;

  // lib/game/core/game-over.js
  var gameOver = () => {
    const mode = engine_default.getMode();
    if (mode === "game-over" || mode === "paused" || mode === "main-menu") {
      return false;
    }
    engine_default.setMode("game-over");
    engine_default.saveHighScore();
    stop_bgm_default();
    sounds_default.gameOver();
  };
  var game_over_default = gameOver;

  // lib/ui/next/clear-next-piece.js
  var clearNextPiece = () => {
    const { nextPiece: nextPiece2, nextPieceContext: nextPieceContext2 } = canvas_default;
    const { width, height } = nextPiece2;
    nextPieceContext2.clearRect(0, 0, width, height);
  };
  var clear_next_piece_default = clearNextPiece;

  // lib/ui/next/render-next-piece.js
  var renderNextPiece = (state) => {
    const { next } = state;
    const { BLACK: BLACK2 } = colors_default;
    const { nextPiece: nextPiece2, nextPieceContext: ctx } = canvas_default;
    const { width, height } = nextPiece2;
    if (!next) return;
    const { shape } = next;
    const gridSize = 5;
    const blockSize2 = Math.floor(width / gridSize);
    const ox = Math.floor((width - shape[0].length * blockSize2) / 2);
    const oy = Math.floor((height - shape.length * blockSize2) / 2);
    clear_next_piece_default();
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const px = ox + x * blockSize2;
        const py = oy + y * blockSize2;
        ctx.fillStyle = next.color;
        ctx.fillRect(px, py, blockSize2 - 2, blockSize2 - 2);
        ctx.strokeStyle = BLACK2;
        ctx.strokeRect(px, py, blockSize2 - 2, blockSize2 - 2);
      }
    }
  };
  var render_next_piece_default = renderNextPiece;

  // lib/game/logic/spawn.js
  var spawn = (state) => {
    const { COLS: COLS2 } = board_default;
    state.curr = state.next ? {
      ...state.next,
      shape: state.next.shape.map((row) => [...row])
    } : random_tetromino_default();
    state.next = random_tetromino_default();
    state.cx = Math.floor(COLS2 / 2) - Math.floor(state.curr.shape[0].length / 2);
    state.cy = 0;
    render_next_piece_default(state.next);
    if (collision_default(0, 0, state)) {
      game_over_default();
    }
  };
  var spawn_default = spawn;

  // lib/engine/restart-game-loop.js
  var restartGameLoop = () => {
    engine_default.stop();
    engine_default.rafId = requestAnimationFrame(start_game_loop_default);
  };
  var restart_game_loop_default = restartGameLoop;

  // lib/utils/pad-start.js
  var padStart = (n, len) => {
    const num = Number(n);
    if (!Number.isFinite(num)) {
      return "";
    }
    const targetLen = Math.max(0, Math.floor(len));
    const sign = num < 0 ? "-" : "";
    const absStr = Math.abs(num).toString();
    return sign + absStr.padStart(targetLen, "0");
  };
  var pad_start_default = padStart;

  // lib/game/core/begin-playing.js
  var beginPlaying = (state) => {
    const $level = document.querySelector("#level");
    if ($level) {
      $level.textContent = pad_start_default(state.level, 2);
    }
    engine_default.setMode("playing");
    spawn_default(state);
    sounds_default.levelStart();
    setTimeout(() => {
      play_bgm_default();
    }, 250);
    engine_default.rafId = requestAnimationFrame(restart_game_loop_default);
  };
  var begin_playing_default = beginPlaying;

  // lib/animations/countdown-animation.js
  var CountdownAnimation = (gameState) => {
    const state = {
      show: true,
      number: 3,
      scale: 4,
      count: 0,
      acc: 0
    };
    return {
      layer: 100,
      // 渲染层级（UI 层，显示在最前面）
      blocking: true,
      // 是否阻塞用户输入（倒计时期间禁止操作）
      name: "countdown",
      // 动画名称标识
      /**
       * ## 更新倒计时动画状态
       *
       * @param {number} delta - 距离上一帧的时间差（秒）
       * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
       */
      update(delta) {
        state.acc += delta;
        if (state.acc < 0.01) {
          return true;
        }
        state.acc = 0;
        render_countdown_default(state);
        state.count++;
        state.scale = Math.max(1, state.scale - 0.4);
        if (state.count >= 50) {
          state.count = 0;
          state.number -= 1;
          state.scale = 4;
          if (state.number >= 1) {
            sounds_default.countdown();
          }
        }
        if (state.number <= 0) {
          this.stop();
          return false;
        }
        return true;
      },
      stop() {
        set_mode_default("playing");
        begin_playing_default(gameState);
      },
      // 渲染倒计时动画：将当前状态传递给渲染函数
      render() {
        render_countdown_default(state);
      }
    };
  };
  var countdown_animation_default = CountdownAnimation;

  // lib/controllers/countdown-controller.js
  var startCountdown = (state) => {
    registerAnimation(countdown_animation_default(state));
  };
  var countdown_controller_default = startCountdown;

  // lib/game/core/start-game.js
  var startGame = (state) => {
    state.baseLines = (state.level - 1) * 10;
    countdown_controller_default(state);
  };
  var start_game_default = startGame;

  // lib/game/actions/select-level.js
  var selectLevel = (level) => {
    engine_default.setLevel(level);
    sounds_default.levelSelect();
  };
  var select_level_default = selectLevel;

  // lib/command/actions/main-menu-actions.js
  var MAIN_MENU_ACTIONS = {
    /** ## 选择难度 1 */
    LEVEL_ONE: () => {
      select_level_default(1);
    },
    LEVEL_TWO: () => {
      select_level_default(2);
    },
    LEVEL_THREE: () => {
      select_level_default(3);
    },
    LEVEL_FOUR: () => {
      select_level_default(4);
    },
    LEVEL_FIVE: () => {
      select_level_default(5);
    },
    LEVEL_SIX: () => {
      select_level_default(6);
    },
    LEVEL_SEVEN: () => {
      select_level_default(7);
    },
    LEVEL_EIGHT: () => {
      select_level_default(8);
    },
    LEVEL_NINE: () => {
      select_level_default(9);
    },
    LEVEL_TEN: () => {
      select_level_default(10);
    },
    /**
     * ## 确认开始游戏
     *
     * @param {object} _ 参数对象
     * @param {object} engine - 游戏引擎（实例）
     */
    CONFIRM: (_, engine) => {
      start_game_default(engine.state);
    }
  };
  var main_menu_actions_default = MAIN_MENU_ACTIONS;

  // lib/game/logic/move.js
  var move = (ox, oy, state) => {
    if (!collision_default(ox, oy, state)) {
      state.cx += ox;
      state.cy += oy;
      sounds_default.move();
      return true;
    }
    return false;
  };
  var move_default = move;

  // lib/game/logic/rotate.js
  var rotate = (state) => {
    const { curr } = state;
    if (!curr) {
      return;
    }
    const prev = curr.shape;
    curr.shape = prev[0].map((_, i) => prev.map((r) => r[i]).toReversed());
    if (collision_default(0, 0, state)) {
      curr.shape = prev;
    } else {
      sounds_default.rotate();
    }
  };
  var rotate_default = rotate;

  // lib/game/logic/lock.js
  var lock = (state) => {
    const { curr } = state;
    const s = curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          state.board[state.cy + y][state.cx + x] = curr.color;
        }
      }
    }
  };
  var lock_default = lock;

  // lib/engine/state/set-level.js
  var setLevel = (level) => {
    engine_state_default.level = level;
  };
  var set_level_default = setLevel;

  // lib/ui/core/render-block.js
  var renderBlock = (ctx, x, y, color) => {
    const { RGBA_BLACK: RGBA_BLACK2 } = colors_default;
    const { blockSize: blockSize2 } = canvas_default;
    const gap = 1;
    const size = blockSize2 - gap * 2;
    const px = x * blockSize2 + gap;
    const py = y * blockSize2 + gap;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, size, size);
    ctx.strokeStyle = RGBA_BLACK2;
    ctx.strokeRect(px, py, size, size);
  };
  var render_block_default = renderBlock;

  // lib/ui/board/render-clear.js
  var renderClear = (state) => {
    const { COLS: COLS2 } = board_default;
    const { gameBoardContext: ctx } = canvas_default;
    for (const line of state.lines) {
      ctx.save();
      ctx.globalAlpha = line.alpha;
      for (let x = 0; x < COLS2; x++) {
        render_block_default(ctx, x, line.y, line.color);
      }
      ctx.restore();
    }
  };
  var render_clear_default = renderClear;

  // lib/ui/hud/hud-dom.js
  var HudDom = {
    /** @type {HTMLElement | null} 分数显示元素 */
    score: document.querySelector("#score"),
    /** @type {HTMLElement | null} 行数显示元素 */
    lines: document.querySelector("#lines"),
    /** @type {HTMLElement | null} 等级显示元素 */
    level: document.querySelector("#level"),
    /** @type {HTMLElement | null} 最高分显示元素 */
    highScore: document.querySelector("#highScore")
  };
  var hud_dom_default = HudDom;

  // lib/ui/hud/animate-hud-number.js
  var animateHUDNumber = (from, to, duration, onUpdate, onComplete) => {
    let rafId = null;
    if (from === to) {
      return null;
    }
    let elapsed = 0;
    let lastTimestamp = 0;
    const step = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      elapsed += delta;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(from + (to - from) * progress);
      onUpdate(value, rafId);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(rafId);
        onComplete?.();
      }
    };
    rafId = requestAnimationFrame(step);
    return {
      cancel: () => cancelAnimationFrame(rafId)
    };
  };
  var animate_hud_number_default = animateHUDNumber;

  // lib/ui/hud/create-hud.js
  var setText = (el, value, pad = 0) => el.textContent = pad ? pad_start_default(value, pad) : String(value);
  var createHud = () => {
    const prev = {
      score: 0,
      lines: 0,
      level: 1,
      highScore: 0
    };
    const target = {
      score: 0
    };
    const animating = {
      score: false
    };
    const updateScore = (next) => {
      target.score = next;
      if (animating.score) return;
      animating.score = true;
      animate_hud_number_default(
        prev.score,
        target.score,
        300,
        // 每帧更新 UI
        (v) => {
          setText(hud_dom_default.score, v, 5);
        },
        // 动画结束回调
        () => {
          prev.score = target.score;
          animating.score = false;
          if (prev.score !== target.score) {
            updateScore(target.score);
          }
        }
      );
    };
    const updateLines = (next) => {
      if (next !== prev.lines) {
        setText(hud_dom_default.lines, next, 2);
        prev.lines = next;
      }
    };
    const updateLevel = (next) => {
      if (next === prev.level) {
        return;
      }
      setText(hud_dom_default.level, next, 2);
      prev.level = next;
    };
    const updateHighScore = (next) => {
      if (next !== prev.highScore) {
        setText(hud_dom_default.highScore, next, 5);
        prev.highScore = next;
      }
    };
    const update = (state) => {
      updateScore(state.score);
      updateLines(state.lines);
      updateLevel(state.level);
      updateHighScore(state.highScore);
    };
    const reset = () => {
      prev.score = prev.lines = prev.level = prev.highScore = 0;
      animating.score = false;
      setText(hud_dom_default.score, 0, 5);
      setText(hud_dom_default.lines, 0, 2);
      setText(hud_dom_default.level, 1, 2);
      setText(hud_dom_default.highScore, 0, 5);
    };
    return {
      update,
      reset
    };
  };
  var create_hud_default = createHud;

  // lib/ui/hud/render-hud.js
  var renderHud = (score, lines, level, highScore, needReset = false) => {
    const hud = create_hud_default();
    const mode = engine_default.getMode();
    if (mode === "main-menu" || needReset) {
      hud.reset();
    }
    hud.update({
      score,
      lines,
      level,
      highScore
    });
  };
  var render_hud_default = renderHud;

  // lib/ui/constants/firework-colors.js
  var { TEAL: TEAL3, YELLOW: YELLOW3, PURPLE: PURPLE2, ORANGE: ORANGE3, GREEN: GREEN3, RED: RED3 } = colors_default;
  var FIREWORK_COLORS = [TEAL3, YELLOW3, PURPLE2, ORANGE3, GREEN3, RED3];
  var firework_colors_default = FIREWORK_COLORS;

  // lib/ui/effects/render-fireworks.js
  var renderFireworks = (fireworks) => {
    const { gameBoardContext: ctx } = canvas_default;
    for (const fire of fireworks) {
      ctx.globalAlpha = fire.alpha;
      ctx.fillStyle = fire.color;
      ctx.beginPath();
      ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
      ctx.fill();
      fire.x += fire.vx;
      fire.y += fire.vy;
      fire.alpha -= 0.024;
    }
    ctx.globalAlpha = 1;
  };
  var render_fireworks_default = renderFireworks;

  // lib/ui/text/render-level-up-text.js
  var renderLevelUpText = () => {
    const { GREEN: GREEN6 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "LEVEL UP",
      x: width / 2,
      y: height / 2.5,
      color: GREEN6,
      size: 1.2,
      center: true
    });
  };
  var render_level_up_text_default = renderLevelUpText;

  // lib/ui/text/render-level-number.js
  var renderLevelNumber = (level, y) => {
    const { GREEN: GREEN6 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width } = gameBoard2;
    render_text_default({
      text: String(level),
      x: width / 2,
      y,
      color: GREEN6,
      size: 3,
      center: true
    });
  };
  var render_level_number_default = renderLevelNumber;

  // lib/ui/text/render-congrats-text.js
  var renderCongratsText = () => {
    const { YELLOW: YELLOW5, BLACK: BLACK2 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "CONGRATS!",
      x: width / 2,
      y: height / 1.6,
      color: YELLOW5,
      stroke: true,
      strokeColor: BLACK2,
      lineWidth: 3,
      size: 1.3,
      center: true
    });
  };
  var render_congrats_text_default = renderCongratsText;

  // lib/ui/effects/render-level-up.js
  function renderLevelUp(level, fireworks) {
    const { gameBoard: gameBoard2 } = canvas_default;
    const { height } = gameBoard2;
    render_overlay_default();
    render_tetris_text_default();
    render_level_up_text_default();
    render_level_number_default(level, height / 1.85);
    render_congrats_text_default();
    render_fireworks_default(fireworks);
  }
  var render_level_up_default = renderLevelUp;

  // lib/animations/level-up-animation.js
  var LevelUpAnimation = class {
    /**
     * ## 创建升级动画实例
     *
     * @param {object} state - 动画完成时的回调函数
     */
    constructor(state) {
      this.fireworks = this.createFireworks();
      this.duration = 3;
      this.spawnTimer = 0;
      this.layer = 100;
      this.blocking = true;
      this.timer = 0;
      this.name = "level-up";
      this.state = state;
    }
    /**
     * ## 创建一组烟花粒子
     *
     * 在画布中心上方位置生成随机方向和速度的粒子
     *
     * @returns {object[]} 烟花粒子对象数组
     */
    createFireworks() {
      const { width, height } = canvas_default.gameBoard;
      const particles = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 15;
        particles.push({
          x: width / 2,
          // 初始X坐标：画布中心
          y: height / 2 - 60,
          // 初始Y坐标：画布中心上方60像素
          vx: Math.cos(angle) * speed,
          // X轴速度分量
          vy: Math.sin(angle) * speed,
          // Y轴速度分量
          radius: 3 + Math.random() * 4,
          // 粒子半径（3-7像素）
          color: firework_colors_default[Math.floor(Math.random() * firework_colors_default.length)],
          // 随机颜色
          alpha: 1
          // 初始完全不透明
        });
      }
      return particles;
    }
    /**
     * ## 更新动画状态
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
     */
    update(delta) {
      this.timer += delta;
      this.spawnTimer += delta;
      this.updateFireworks(delta);
      if (this.spawnTimer > 0.6) {
        this.fireworks.push(...this.createFireworks());
        this.spawnTimer = 0;
      }
      if (this.timer >= this.duration) {
        this.stop();
        return false;
      }
      return true;
    }
    stop() {
      play_bgm_default();
    }
    /**
     * ## 更新所有烟花粒子的物理状态
     *
     * 包括：速度衰减、重力影响、位置更新、透明度衰减、半径增大
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     */
    updateFireworks(delta) {
      const gravity = 0.01;
      for (const p of this.fireworks) {
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += gravity * delta;
        p.x += p.vx * delta * 8e-3;
        p.y += p.vy * delta * 8e-3;
        p.alpha -= delta * 0.024;
        p.radius += delta * 10;
      }
      this.fireworks = this.fireworks.filter((p) => p.alpha > 0);
    }
    /**
     * ## 渲染升级动画
     *
     * 调用专门渲染函数显示"LEVEL UP"文字和烟花效果
     */
    render() {
      const { fireworks, state } = this;
      const { level } = state;
      render_level_up_default(level, fireworks);
    }
  };
  var level_up_animation_default = LevelUpAnimation;

  // lib/controllers/level-up-controller.js
  var startLevelUp = (state) => {
    const animation2 = new level_up_animation_default(state);
    stop_bgm_default();
    sounds_default.levelUp();
    registerAnimation(animation2);
  };
  var level_up_controller_default = startLevelUp;

  // lib/animations/clear-lines-animation.js
  var ClearLinesAnimation = class {
    /**
     * ## 创建消除行动画实例
     *
     * @param {number[]} lines - 需要消除的行索引数组
     * @param {object} state - 游戏状态.
     */
    constructor(lines, state) {
      this.lines = lines.map((y) => ({
        // 行的Y坐标（行号）
        y,
        // 当前透明度（1=完全不透明，0=完全透明）
        alpha: 1,
        // 动画计时器（秒）
        timer: 0
      }));
      this.state = state;
      this.layer = 200;
      this.blocking = true;
      this.name = "clear-lines";
      sounds_default.clear(lines.length - 1);
    }
    /**
     * ## 更新动画状态
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
     */
    update(delta) {
      let done = true;
      for (const line of this.lines) {
        const phase = Math.floor(line.timer / 0.12);
        line.alpha = phase % 2 === 0 ? 1 : 0;
        line.timer += delta;
        if (line.timer < 0.72) {
          done = false;
        }
      }
      if (done) {
        this.stop();
        return false;
      }
      return true;
    }
    /**
     * ## 动画完成后的清理工作
     *
     * 执行实际的行的消除、分数更新、等级提升等逻辑
     */
    stop() {
      const { CLEAR_SCORES: CLEAR_SCORES2, MAX_LEVEL: MAX_LEVEL2 } = game_default;
      const { ROWS: ROWS2, COLS: COLS2 } = board_default;
      const { state } = this;
      const lines = state.clearLines || [];
      const cleared = lines.length;
      for (let y = ROWS2 - 1; y >= 0; y--) {
        const isFullLine = state.board[y].every(Boolean);
        if (isFullLine) {
          state.board.splice(y, 1);
          state.board.unshift(Array.from({ length: COLS2 }).fill(0));
          y++;
        }
      }
      state.clearLines = [];
      state.lines += cleared;
      state.score += CLEAR_SCORES2[cleared] * state.level;
      const totalLines = state.baseLines + state.lines;
      const newLevel = Math.floor(totalLines / 10) + 1;
      if (newLevel > state.level) {
        level_up_controller_default(state);
      }
      set_level_default(Math.min(Math.max(state.level, newLevel), MAX_LEVEL2));
      render_hud_default(state.score, state.lines, state.level, state.highScore);
    }
    /**
     * ## 渲染动画效果
     *
     * 先渲染活动区块，再渲染消除行的闪烁效果
     */
    render() {
      render_clear_default({ lines: this.lines });
    }
  };
  var clear_lines_animation_default = ClearLinesAnimation;

  // lib/controllers/clear-lines-controller.js
  var startClearLines = (lines, state) => {
    const animation2 = new clear_lines_animation_default(lines, state);
    registerAnimation(animation2);
  };
  var clear_lines_controller_default = startClearLines;

  // lib/game/logic/clear-lines.js
  var clearLines = (state) => {
    const { ROWS: ROWS2 } = board_default;
    let clear = 0;
    const linesToClear = [];
    for (let y = ROWS2 - 1; y >= 0; y--) {
      const isLineFull = state.board[y].every((cell) => !!cell);
      if (isLineFull) {
        linesToClear.push(y);
        clear++;
      }
    }
    if (clear === 0) {
      engine_default.saveHighScore();
      return false;
    }
    state.clearLines = linesToClear;
    clear_lines_controller_default(linesToClear, state);
    return true;
  };
  var clear_lines_default = clearLines;

  // lib/game/logic/drop.js
  var drop = (state) => {
    while (true) {
      if (!move_default(0, 1, state)) {
        break;
      }
    }
    lock_default(state);
    sounds_default.fall();
    clear_lines_default(state);
    spawn_default(state);
    sounds_default.drop();
  };
  var drop_default = drop;

  // lib/game/core/restart-game.js
  var restartGame = (state) => {
    const mode = engine_default.getMode();
    if (mode === "paused" || mode === "game-over" || mode === "main-menu") {
      return;
    }
    stop_bgm_default();
    engine_default.setMode("playing");
    engine_default.setHud({
      score: 0,
      lines: 0,
      level: 1
    });
    engine_default.resetBoard();
    const { score, lines, level, highScore } = state;
    render_hud_default(score, lines, level, highScore, true);
    spawn_default(state);
    play_bgm_default();
    engine_default.restart();
  };
  var restart_game_default = restartGame;

  // lib/animations/paused-animation.js
  var PausedAnimation = class {
    /**
     * ## 创建暂停动画实例
     *
     * @param {number} [layer=500] - 渲染层级，默认 500（显示在游戏界面上层） 使用较高的默认值确保暂停界面覆盖游戏内容.
     *   Default is `500`
     */
    constructor(layer = 500) {
      this.layer = layer;
      this.blocking = true;
      this.timer = 0;
      this.active = true;
      this.name = "paused";
    }
    /**
     * ## 更新暂停动画状态
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     * @returns {boolean} - 始终返回 true，表示动画永远不会自动结束
     */
    update(delta) {
      if (!this.active) {
        return false;
      }
      this.timer += delta;
      if (this.timer >= 1) {
        sounds_default.secondTick();
        this.timer = 0;
      }
      return true;
    }
    stop() {
      this.active = false;
    }
    /**
     * ## 渲染暂停动画
     *
     * 将暂停界面绘制到屏幕上
     */
    render() {
      this.active = true;
    }
  };
  var paused_animation_default = PausedAnimation;

  // lib/controllers/paused-controller.js
  var animation = null;
  var startPaused = () => {
    if (animation) {
      return;
    }
    animation = new paused_animation_default();
    registerAnimation(animation);
  };
  var stopPaused = () => {
    if (!animation) {
      return;
    }
    animation.stop();
    animation = null;
  };

  // lib/game/core/toggle-pause.js
  var togglePause = () => {
    const mode = engine_default.getMode();
    if (mode === "game-over" || mode === "main-menu") {
      return false;
    }
    if (mode === "playing") {
      engine_default.setMode("paused");
      stop_bgm_default();
      sounds_default.pause();
      startPaused();
    } else {
      stopPaused();
      engine_default.setMode("playing");
      sounds_default.resume();
      play_bgm_default();
      engine_default.restart();
    }
  };
  var toggle_pause_default = togglePause;

  // lib/audio/toggle-bgm.js
  var toggleBGM = () => {
    const mode = engine_default.getMode();
    if (mode === "main-menu" || mode === "paused" || mode === "game-over") {
      return;
    }
    audio_state_default.bgmEnabled = !audio_state_default.bgmEnabled;
    sounds_default.bgmToggle();
    if (audio_state_default.bgmEnabled) {
      play_bgm_default();
    } else {
      stop_bgm_default();
    }
  };
  var toggle_bgm_default = toggleBGM;

  // lib/command/actions/game-playing-actions.js
  var GAME_PLAYING_ACTIONS = {
    /**
     * ## 向左移动
     *
     * @param {object} _ 参数对象
     * @param {object} engine - 游戏引擎（实例）
     */
    MOVE_LEFT: (_, engine) => {
      move_default(-1, 0, engine.state);
    },
    /**
     * ## 向右移动
     *
     * @param {object} _ 参数对象
     * @param {object} engine - 游戏引擎（实例）
     */
    MOVE_RIGHT: (_, engine) => {
      move_default(1, 0, engine.state);
    },
    /**
     * ## 向下移动（软降）
     *
     * @param {object} _ 参数对象
     * @param {object} engine - 游戏引擎（实例）
     */
    MOVE_DOWN: (_, engine) => {
      move_default(0, 1, engine.state);
    },
    /**
     * ## 硬降（直接落地）
     *
     * @param {object} _ 参数对象
     * @param {object} engine - 游戏引擎（实例）
     */
    DROP: (_, engine) => {
      drop_default(engine.state);
    },
    /**
     * ## 旋转方块
     *
     * @param {object} _ 参数对象
     * @param {object} engine - 游戏引擎（实例）
     */
    ROTATE: (_, engine) => {
      rotate_default(engine.state);
    },
    /**
     * ## 重新开始游戏
     *
     * @param {object} _ 参数对象
     * @param {object} engine - 游戏引擎（实例）
     */
    RESTART: (_, engine) => {
      restart_game_default(engine.state);
    },
    /**
     * ## 强制结束游戏
     *
     * 注意：直接调用 gameOver 属于“全局副作用”
     */
    QUIT: () => {
      game_over_default();
    },
    /** ## 暂停 / 继续切换 */
    TOGGLE_PAUSE: () => {
      toggle_pause_default();
    },
    /** ## 背景音乐开关 */
    TOGGLE_MUSIC: () => {
      toggle_bgm_default();
    }
  };
  var game_playing_actions_default = GAME_PLAYING_ACTIONS;

  // lib/command/actions/paused-actions.js
  var PAUSED_ACTIONS = {
    /** ## 切换暂停状态（继续游戏 / 重新进入游戏循环） */
    TOGGLE_PAUSE: () => {
      toggle_pause_default();
    }
  };
  var paused_actions_default = PAUSED_ACTIONS;

  // lib/engine/state/reset-board.js
  var resetBoard = () => {
    const { COLS: COLS2, ROWS: ROWS2 } = board_default;
    engine_state_default.board = Array.from(
      { length: ROWS2 },
      () => Array.from({ length: COLS2 }).fill(0)
    );
  };
  var reset_board_default = resetBoard;

  // lib/game/core/reset-to-main-menu.js
  var resetToMainMenu = (state) => {
    stop_bgm_default();
    engine_default.start();
    reset_board_default();
    engine_default.setMode("main-menu");
    engine_default.setHud({
      score: 0,
      lines: 0,
      level: 1
    });
    state.next = null;
    const { score, lines, level, highScore } = state;
    render_hud_default(score, lines, level, highScore);
  };
  var reset_to_main_menu_default = resetToMainMenu;

  // lib/command/actions/game-over-actions.js
  var GAME_OVER_ACTIONS = {
    /**
     * 确认操作（例如：Enter / Space / OK）
     *
     * 作用：
     *
     * - 重置游戏状态
     * - 返回主菜单
     *
     * @param {object} _ - Action payload（当前未使用）
     * @param {object} engine - 游戏引擎实例
     */
    CONFIRM: (_, engine) => {
      reset_to_main_menu_default(engine.state);
    }
  };
  var game_over_actions_default = GAME_OVER_ACTIONS;

  // lib/command/dispatch-command.js
  var ACTIONS_MAP = {
    "main-menu": main_menu_actions_default,
    playing: game_playing_actions_default,
    paused: paused_actions_default,
    "game-over": game_over_actions_default
  };
  var dispatchCommand = (cmd, engine) => {
    const { type, payload } = cmd;
    const mode = engine.getMode();
    const actions = ACTIONS_MAP[mode];
    if (!actions) {
      return;
    }
    const handler = actions[type];
    handler?.(payload, engine);
  };
  var dispatch_command_default = dispatchCommand;

  // lib/command/command.js
  var Command = class {
    /**
     * ## 创建一个命令实例
     *
     * @param {string} type - 命令类型（如 MOVE / ROTATE）
     * @param {object} [payload={}] - 命令参数（如方向、等级等）. Default is `{}`
     */
    constructor(type, payload = {}) {
      this.type = type;
      this.payload = payload;
    }
    /**
     * ## 执行命令
     *
     * 将命令交给统一的 dispatch 系统处理， 而不是在 Command 内部写逻辑。
     *
     * @param {object} engine - 游戏引擎实例
     */
    execute(engine) {
      dispatch_command_default(this, engine);
    }
  };
  var command_default = Command;

  // lib/game/logic/get-speed.js
  var getSpeed = (state) => (
    // 计算速度：基础值1000ms，每升一级减少80ms，最低不低于100ms
    Math.max(100, 1e3 - (state.level - 1) * 80)
  );
  var get_speed_default = getSpeed;

  // lib/game/core/step-game.js
  var stepGame = (state) => {
    const mode = engine_default.getMode();
    if (mode === "main-menu" || mode === "game-over" || hasBlockingAnimation()) {
      return false;
    }
    if (!move_default(0, 1, state)) {
      lock_default(state);
      sounds_default.fall();
      clear_lines_default(state);
      spawn_default(state);
      if (mode === "game-over") {
        return false;
      }
    }
    return true;
  };
  var step_game_default = stepGame;

  // lib/engine/start-game-loop.js
  var startGameLoop = (timestamp) => {
    if (!engine_default.timestamp) {
      engine_default.timestamp = timestamp;
    }
    const { state } = engine_default;
    const stepDelta = timestamp - engine_default.accumulator;
    let delta = (timestamp - engine_default.timestamp) / 1e3;
    if (delta > 1e3) {
      delta = 1e3;
    }
    const dropInterval = get_speed_default(state);
    engine_default.timestamp = timestamp;
    if (replay_default.playing) {
      const { data } = replay_default;
      while (replay_default.cursor < data.length && data[replay_default.cursor].frame === replay_default.frame) {
        const item = data[replay_default.cursor];
        command_queue_default.enqueue(new command_default(item.cmd.type, item.cmd.payload));
        replay_default.cursor++;
      }
    }
    command_queue_default.flush(engine_default);
    engine_default.update(delta);
    replay_default.frame++;
    if (!engine_default.accumulator || stepDelta > dropInterval) {
      step_game_default(state);
      engine_default.accumulator = timestamp;
    }
    engine_default.render();
    engine_default.animate();
    engine_default.rafId = requestAnimationFrame(startGameLoop);
  };
  var start_game_loop_default = startGameLoop;

  // lib/engine/stop-game-loop.js
  var stopGameLoop = () => {
    if (!engine_default.rafId) {
      return;
    }
    cancelAnimationFrame(engine_default.rafId);
    engine_default.rafId = null;
    engine_default.timestamp = 0;
    engine_default.accumulator = 0;
  };
  var stop_game_loop_default = stopGameLoop;

  // lib/input/on-resize.js
  var onResize = () => {
    engine_default.resize();
  };
  var on_resize_default = onResize;

  // lib/input/dispatch-input.js
  var dispatchInput = (input) => {
    const { action } = input;
    const isBlocked = hasBlockingAnimation(["countdown", "level-up"]);
    if (isBlocked || !action) {
      return;
    }
    const cmd = new command_default(action);
    command_queue_default.enqueue(cmd);
    if (replay_default.recording) {
      replay_default.data.push({
        frame: replay_default.frame,
        cmd
      });
    }
  };
  var dispatch_input_default = dispatchInput;

  // lib/input/resolve-input-action.js
  var ACTION_MAP = {
    arrowleft: "MOVE_LEFT",
    arrowright: "MOVE_RIGHT",
    arrowdown: "MOVE_DOWN",
    arrowup: "ROTATE",
    " ": "DROP",
    m: "TOGGLE_MUSIC",
    p: "TOGGLE_PAUSE",
    r: "RESTART",
    q: "QUIT",
    1: "LEVEL_ONE",
    2: "LEVEL_TWO",
    3: "LEVEL_THREE",
    4: "LEVEL_FOUR",
    5: "LEVEL_FIVE",
    6: "LEVEL_SIX",
    7: "LEVEL_SEVEN",
    8: "LEVEL_EIGHT",
    9: "LEVEL_NINE",
    t: "LEVEL_TEN",
    enter: "CONFIRM"
  };
  var resolveInputAction = (key) => {
    if (!key) {
      return;
    }
    const normalizedKey = key.toLowerCase();
    return ACTION_MAP[normalizedKey];
  };
  var resolve_input_action_default = resolveInputAction;

  // lib/input/on-keydown.js
  var onKeydown = (e) => {
    const key = e.key.toLowerCase();
    const action = resolve_input_action_default(key);
    if (!action) {
      return;
    }
    dispatch_input_default({
      type: "keydown",
      key,
      action
    });
  };
  var on_keydown_default = onKeydown;

  // lib/input/bind-events.js
  var bindEvents = () => {
    globalThis.addEventListener("resize", on_resize_default);
    document.addEventListener("keydown", on_keydown_default);
  };
  var bind_events_default = bindEvents;

  // lib/utils/get-storage.js
  var getStorage = (key) => localStorage.getItem(key);
  var get_storage_default = getStorage;

  // lib/engine/state/load-high-score.js
  var loadHighScore = () => {
    engine_state_default.highScore = Number.parseInt(get_storage_default("tetris-high-score"), 10) || 0;
  };
  var load_high_score_default = loadHighScore;

  // lib/utils/set-storage.js
  var setStorage = (key, value) => {
    localStorage.setItem(key, value);
  };
  var set_storage_default = setStorage;

  // lib/engine/state/save-high-score.js
  var saveHighScore = () => {
    const { score } = engine_state_default;
    if (score > engine_state_default.highScore) {
      engine_state_default.highScore = score;
      set_storage_default("tetris-high-score", engine_state_default.highScore.toString());
    }
  };
  var save_high_score_default = saveHighScore;

  // lib/engine/state/get-mode.js
  var getMode = () => engine_state_default.mode;
  var get_mode_default = getMode;

  // lib/ui/text/render-level-text.js
  var renderLevelText = () => {
    const { GREEN: GREEN6 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "LEVEL",
      x: width / 2,
      y: height * 0.35,
      color: GREEN6,
      size: 1,
      center: true
    });
  };
  var render_level_text_default = renderLevelText;

  // lib/ui/text/render-level-shortcut.js
  var renderLevelShortcut = () => {
    const { WHITE: WHITE3 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "1-9 or T KEY",
      x: width / 2,
      y: height * 0.58,
      color: WHITE3,
      size: 1,
      center: true
    });
  };
  var render_level_shortcut_default = renderLevelShortcut;

  // lib/ui/text/render-enter-start-text.js
  var renderEnterStartText = () => {
    const { TEAL: TEAL5, BLACK: BLACK2 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "ENTER START",
      x: width / 2,
      y: height * 0.74,
      color: TEAL5,
      strokeColor: BLACK2,
      size: 1.15,
      center: true,
      stroke: true
    });
  };
  var render_enter_start_text_default = renderEnterStartText;

  // lib/ui/scenes/main-menu-scene/render-main-menu.js
  var renderMainMenu = (level) => {
    const { gameBoard: gameBoard2 } = canvas_default;
    const { height } = gameBoard2;
    clear_board_default();
    render_overlay_default();
    render_scene_background_default("main-menu");
    render_tetris_text_default();
    render_level_text_default();
    render_level_number_default(level, height * 0.5);
    render_level_shortcut_default();
    render_enter_start_text_default();
  };
  var render_main_menu_default = renderMainMenu;

  // lib/ui/scenes/main-menu-scene/lazy-render-main-menu.js
  var lazyRenderMainMenu = (state) => {
    if (document?.fonts?.load) {
      document.fonts.load('40px "Press Start 2P"').then(() => {
        render_main_menu_default(state.level);
      });
    } else {
      setTimeout(() => {
        render_main_menu_default(state.level);
      }, 150);
    }
  };
  var lazy_render_main_menu_default = lazyRenderMainMenu;

  // lib/ui/scenes/main-menu-scene/index.js
  var mainMenuScene = (state) => {
    render_main_menu_default(state.level);
  };
  var main_menu_scene_default = mainMenuScene;

  // lib/ui/text/render-paused-text.js
  var renderPausedText = () => {
    const { YELLOW: YELLOW5, BLACK: BLACK2 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "PAUSED",
      x: width / 2,
      y: height / 1.4,
      color: YELLOW5,
      strokeColor: BLACK2,
      size: 1.6,
      center: true,
      stroke: true
    });
  };
  var render_paused_text_default = renderPausedText;

  // lib/utils/format-time.js
  var formatTime = (date, format = "yyyy-MM-dd HH:mm:ss") => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const toSymbol = () => hours >= 12 ? "PM" : "AM";
    const hasSymbol = format.includes("a");
    const hour12 = hours % 12 || 12;
    const symbols = {
      yyyy: year,
      MM: pad_start_default(month, 2),
      dd: pad_start_default(day, 2),
      HH: pad_start_default(hours, 2),
      hh: pad_start_default(hour12, 2),
      mm: pad_start_default(minutes, 2),
      ss: pad_start_default(seconds, 2),
      a: hasSymbol ? toSymbol() : ""
    };
    let time = format;
    for (const key of Object.keys(symbols)) {
      time = time.replace(new RegExp(key, "g"), symbols[key]);
    }
    return time;
  };
  var format_time_default = formatTime;

  // lib/ui/effects/render-digital-clock.js
  var { GREEN: GREEN4 } = colors_default;
  var renderDigitalClock = (time, color = GREEN4, format = "HH:mm:ss") => {
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    const text = format_time_default(time || /* @__PURE__ */ new Date(), format);
    render_text_default({
      text,
      x: width / 2,
      y: height / 4.15,
      color,
      size: 0.94,
      center: true
    });
  };
  var render_digital_clock_default = renderDigitalClock;

  // lib/ui/effects/clock/constants/clock-themes.js
  var {
    CORAL: CORAL2,
    RGBA_CORAL: RGBA_CORAL2,
    WHITE: WHITE2,
    RGBA_WHITE: RGBA_WHITE3,
    PURPLE: PURPLE3,
    RGBA_PURPLE: RGBA_PURPLE2,
    TEAL: TEAL4,
    RGBA_TEAL: RGBA_TEAL2,
    PINK: PINK3,
    RGBA_PINK: RGBA_PINK2,
    ORANGE: ORANGE4,
    RGBA_ORANGE: RGBA_ORANGE2,
    GREEN: GREEN5,
    RGBA_GREEN: RGBA_GREEN2,
    BLUE: BLUE3,
    RGBA_BLUE: RGBA_BLUE2,
    YELLOW: YELLOW4,
    RGBA_YELLOW: RGBA_YELLOW2,
    RED: RED4,
    RGBA_RED: RGBA_RED2,
    VIOLET: VIOLET3,
    RGBA_VIOLET: RGBA_VIOLET2,
    CYAN: CYAN2,
    RGBA_CYAN: RGBA_CYAN2
  } = colors_default;
  var ClockThemes = {
    Teal: {
      stroke: TEAL4,
      face: RGBA_TEAL2,
      secondHand: VIOLET3
    },
    Violet: {
      stroke: VIOLET3,
      face: RGBA_VIOLET2,
      secondHand: TEAL4
    },
    Yellow: {
      stroke: YELLOW4,
      face: RGBA_YELLOW2,
      secondHand: PINK3
    },
    Pink: {
      stroke: PINK3,
      face: RGBA_PINK2,
      secondHand: YELLOW4
    },
    Purple: {
      stroke: PURPLE3,
      face: RGBA_PURPLE2,
      secondHand: GREEN5
    },
    Green: {
      stroke: GREEN5,
      face: RGBA_GREEN2,
      secondHand: CYAN2
    },
    Blue: {
      stroke: BLUE3,
      face: RGBA_BLUE2,
      secondHand: CORAL2
    },
    Coral: {
      stroke: CORAL2,
      face: RGBA_CORAL2,
      secondHand: BLUE3
    },
    Orange: {
      stroke: ORANGE4,
      face: RGBA_ORANGE2,
      secondHand: CYAN2
    },
    Cyan: {
      stroke: CYAN2,
      face: RGBA_CYAN2,
      secondHand: ORANGE4
    },
    White: {
      stroke: WHITE2,
      face: RGBA_WHITE3,
      secondHand: RED4
    },
    Red: {
      stroke: RED4,
      face: RGBA_RED2,
      secondHand: WHITE2
    }
  };
  var clock_themes_default = ClockThemes;

  // lib/ui/effects/clock/utils/get-clock-angles.js
  var getClockAngles = (time) => {
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const hAng = (h % 12 + m / 60 + s / 3600) * (2 * Math.PI / 12);
    const mAng = (m + s / 60) * (2 * Math.PI / 60);
    const sAng = s * (2 * Math.PI / 60);
    return {
      hAng,
      mAng,
      sAng
    };
  };
  var get_clock_angles_default = getClockAngles;

  // lib/ui/constants/images/chinese-hour-animals.js
  var { RGBA_WHITE: RGBA_WHITE4 } = colors_default;
  var ChineseHourAnimals = {
    rat: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="m210.432 1012.898-43.574-31.69C273.812 834.156 352.175 810.01 590.686 808.502c21.397-31.26 16.25-56.266 9.378-89.708-3.557-17.138-7.222-34.843-7.222-54.434 0-68.958 25.33-104.636 63.407-136.973l34.897 41.04c-29.453 25.062-44.41 46.781-44.41 95.933 0 14.094 2.938 28.403 6.064 43.547 5.901 28.51 12.8 62.033-1.132 99.463 166.373-10.24 264.543-96.903 264.543-236.194 0-152.845-88.63-247.808-231.29-247.808-83.644 0-153.303 29.696-174.188 39.613a225 225 0 0 1-20.533 31.34l-41.742-34.116 20.884 17.058-20.91-16.977c.35-.458 36.62-45.999 36.62-97.55 0-34.815-8.946-60.765-26.57-77.069-17.515-16.249-44.786-24.603-81.219-24.953v162.654h-53.895V109.784l24.873-1.914c64.7-4.931 114.095 7.896 146.863 38.239 29.103 26.947 43.843 66.182 43.843 116.628 0 11.102-1.131 21.908-3.072 32.202 37.269-12.584 89.843-25.465 149.046-25.465 173.245 0 285.184 118.433 285.184 301.702 0 140.747-92.618 291.14-352.552 291.14-258.668 0-311.943 19.698-407.121 150.582m19.106-256.836c-12.046 0-24.388-.566-37.026-1.643l-22.097-1.86-2.425-22.016c-.243-2.398-6.306-58.098-6.306-99.516 0-103.586 21.45-178.904 53.895-259.046V107.79h53.895v274.783l-2.021 4.904c-32.014 78.282-51.874 146.324-51.874 243.55 0 22.879 2.102 51.443 3.826 70.98 99.679 2.802 172.814-35.409 222.451-116.494l48.02 24.091c-11.237 28.133-11.372 51.578-.377 67.854 9.701 14.282 28.645 23.175 49.448 23.175v53.894c-39.02 0-74.186-17.515-94.073-46.888a100.2 100.2 0 0 1-12.423-25.546c-53.22 49.179-121.128 73.943-202.913 73.97m150.42-230.588c0-34.223-13.231-44.463-29.642-44.463s-29.642 10.24-29.642 44.463c0 34.25 13.23 44.463 29.642 44.463s29.642-10.213 29.642-44.463"/></svg>`,
    ox: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 -0.5 1025 1025"><path d="M1025.347 635.58v280.63h-53.894v-71.033c-16.33-18.405-69.821-70.413-161.685-86.07v157.104h-53.894V754.526h-107.79v215.58H594.19V700.631h161.685c100.998 0 172.57 38.67 215.579 71.868V656.761c-33.685-43.628-51.712-137.458-53.706-279.498H701.979c-76.935 0-127.219-26.22-175.805-51.55a1556 1556 0 0 0-26.84-13.743c-26.839 26.004-66.209 44.92-115.738 55.511 24.441 22.986 60.874 52.116 106.469 72.839l-22.313 49.044c-76.584-34.816-129.59-88.926-150.824-113.125-10.644.62-21.477 1.024-32.687 1.024a473.7 473.7 0 0 1-123.365-15.953L67.853 547.624l68.582 53.868c31.447-21.935 101.456-62.545 188.28-62.545v53.895c-95.986 0-170.36 62.491-171.088 63.138l-16.788 14.282L0 562.904l109.73-219.81C46.43 314.449 1.347 267.372 1.347 199.869c0-110.053 120.24-145.974 161.685-145.974v53.894c-14.12 0-107.79 17.166-107.79 92.08 0 90.597 136.947 123.5 228.999 123.5 67.907 0 122.422-12.99 157.696-35.625-42.712-14.336-95.097-23.12-169.337-18.324l-3.504-53.787c95.88-6.117 160.149 8.515 211.43 28.834 3.718-9.028 5.874-18.648 5.874-28.888 0-48.856-57.83-76.288-58.395-76.558l22.393-49.017c3.665 1.644 89.897 41.823 89.897 125.575 0 18.567-3.423 35.84-9.998 51.631 7.06 3.584 13.986 7.168 20.777 10.698 46.78 24.415 87.174 45.46 150.905 45.46h269.474v26.948c0 214.69 35.22 266.59 45.999 277.37zm-729.384 25.143-98.79 118.541L283.972 917.1l45.595-28.726-65.913-104.69 37.053-44.437c57.937 45.945 138.374 69.174 239.589 69.174v-53.895c-99.894 0-175.077-24.549-223.475-72.946z"/></svg>`,
    rabbit: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M862.316 720.896c0 36.621-4.123 69.39-24.253 110.35l-68.365 138.86H485.053V916.21h48.37c-25.546-36.137-48.37-82.702-48.37-134.737 0-59.42 24.171-113.314 63.218-152.36l38.104 38.103a161.1 161.1 0 0 0-47.428 114.257c0 54.784 35.382 104.043 63.515 134.737h133.713l53.49-108.76c15.711-31.852 18.756-55.835 18.756-86.555 0-80.977-63.434-150.097-178.607-195.503-17.543 8.138-38.292 13.554-63.92 13.554h-80.841c-13.96 0-43.925 15.98-57.29 40.017l-47.104-26.166c20.749-37.349 67.584-67.745 104.394-67.745h80.842c37.268 0 57.478-15.441 79.09-36.46-19.617-112.398-95.232-179.12-159.932-179.12h-107.79a21.3 21.3 0 0 0-5.955 2.022 684 684 0 0 0-69.12-77.474c-35.84-34.223-61.764-58.934-94.909-79.44a42.44 42.44 0 0 0-21.8-6.792 22.82 22.82 0 0 0-17.381 7.195c-10.914 11.426-6.063 28.241 1.428 39.182 21.989 32.121 47.912 56.859 83.752 91.109 20.615 19.672 49.26 43.17 77.393 63.084C281.007 367.4 215.58 484.433 215.58 592.842c0 74.483 24.792 124.066 51.065 176.586 27.89 55.781 56.724 113.476 56.724 200.677h-53.894c0-74.482-24.792-124.065-51.066-176.586-27.89-55.78-56.724-113.475-56.724-200.677 0-90.866 42.227-197.686 93.454-274.486a804 804 0 0 1-39.047-34.115c-38.238-36.487-65.86-62.841-91.055-99.625-24.441-35.759-22.798-78.686 4.069-106.819 26.3-27.567 70.898-31.043 106.523-9 37.942 23.444 65.563 49.798 103.774 86.258 9.97 9.513 33.038 32.31 56.94 60.55h68.635c-27.621-37.78-60.416-72.73-88.522-99.543-28.834-27.54-54.73-52.116-84.534-74.024L326.306.296c31.232 23.23 57.802 48.533 87.31 76.72 53.84 51.388 94.45 100.594 121.747 146.836 82.837 26.65 150.043 116.87 165.026 230.75l1.725 13.177-9.405 9.405a820 820 0 0 1-11.803 11.587c156.322 72.408 181.41 174.727 181.41 232.125m-552.852 33.63c3.934 8.058 7.895 16.088 11.991 24.145 27.433 54.3 55.808 110.457 55.808 191.434h53.895c0-93.696-34.062-161.226-61.52-215.579zm597.908 53.895c-3.423 9.405-7.815 19.806-13.77 31.96L829.79 970.105h60.066l52.143-105.957c10.78-21.935 17.516-40.017 21.908-55.727zM514.695 390.737c0-34.223-13.231-44.463-29.642-44.463s-29.642 10.24-29.642 44.463c0 34.25 13.23 44.463 29.642 44.463s29.642-10.213 29.642-44.463"/></svg>`,
    dragon: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M552.421 1024c-69.767 0-113.826-13.959-156.402-27.46-54.488-17.273-110.808-35.004-232.422-26.516l-3.826-53.733c131.719-9.458 195.934 10.968 252.524 28.888 42.226 13.366 78.686 24.926 140.126 24.926 92.753 0 148.21-57.937 148.21-113.96 0-16.95-5.524-101.619-114.634-101.619-64.97 0-112.747 23.337-163.328 48.02-57.344 28.026-122.368 59.77-218.381 59.77C85.908 862.316 0 787.294 0 683.897c0-95.77 80.788-198.844 258.183-198.844 86.69 0 155.917 24.818 229.214 51.092 45.81 16.41 92.564 33.172 145.489 44.167 9-7.034 13.85-16.277 13.85-26.76 0-37.187-37.672-74.859-74.131-111.265L569.317 439l38.104-38.104 3.26 3.288c42.173 42.091 89.95 89.842 89.95 149.369 0 12.719-2.802 24.926-7.976 36.11a595 595 0 0 0 61.871 3.18c62.437 0 107.79-34.008 107.79-80.843 0-58.853-52.87-110.269-108.84-164.702l-8.058-7.842c-19.025 16.438-38.077 35.49-59.419 56.832l-38.103-38.104C722.7 283.352 782.794 223.286 916.21 216.253V55.619c-63.408 7.788-120.994 39.424-121.668 39.802l-15.818 8.811-14.12-11.344c-32.903-26.436-54.892-38.993-90.92-38.993-41.419 0-74.349 25.87-109.192 53.302-26.624 20.91-54.137 42.55-86.85 53.194l-8.3 1.293h-69.094L294.723 267.21l-38.103-38.13 67.395-67.396h-162.33V107.79h303.103c22.232-8.272 43.709-25.168 66.399-42.98C569.829 34.438 613.619 0 673.684 0c48.91 0 81.408 17.947 110.889 40.098C813.703 26.3 877.73 0 943.158 0h26.947v323.368h-53.894v-53.167c-54.165 3.1-92.915 15.845-127.003 36.676l1.832 1.778C852.588 368.505 916.21 430.376 916.21 512c0 60.928-43.708 109.945-107.789 127.623v61.009h53.895v-53.895h53.895v53.895h53.894v53.894h-53.894v53.895h-53.895v-53.895H808.42c-29.723 0-53.895-24.171-53.895-53.894v-53.895c-118.326 0-207.063-31.798-285.318-59.877-68.77-24.63-133.713-47.913-211.025-47.913-141.124 0-204.288 72.785-204.288 144.95 0 73.324 61.844 124.524 150.393 124.524 11.91 0 23.229-.539 34.035-1.536 10.132-10.563 31.15-36.244 31.15-67.719 0-33.118-43.088-70.98-58.152-81.596l30.936-44.14c8.3 5.794 81.111 58.664 81.111 125.736 0 19.43-4.527 37.053-10.994 52.305 30.774-10.051 58.314-23.498 86.663-37.349 53.84-26.274 109.54-53.49 186.96-53.49 116.413 0 168.53 78.093 168.53 155.513 0 82.513-75.615 167.855-202.106 167.855m-21.18-623.104-38.104-38.104 137.89-137.89 38.103 38.104zM404.48 382.545l-38.104-38.104 152.98-152.98 38.104 38.104zM686.484 163.92c15.495-9.755 43.332-31.448 43.332-31.448-25.735-27.81-49.557-33.334-67.369-29.076-19.24 4.608-37.753 24.603-37.753 24.603s42.253 22.447 61.79 35.92"/></svg>`,
    tiger: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M673.684 1024c-114.769 0-188.82-33.334-254.167-62.787-53.626-24.145-99.975-45.002-161.28-45.002-40.448 0-83.591 23.255-103.64 45.163l-39.747-36.433c27.648-30.154 84.318-62.625 143.387-62.625 68.392 0 119.862 21.288 172.92 45.056V673.684c0-35.166-17.542-64.108-30.638-80.815-15.199 9.836-32.068 18.89-50.742 26.947l-21.342-49.475C469.8 509.413 485.053 377.317 485.053 323.368V221.642a598 598 0 0 0-80.842-6.063h-26.948v-80.842c0-12.1-14.848-26.948-26.947-26.948-9.378 0-18.836.593-26.948 1.348v160.337h-53.894v-57.802c-136.03 102.912-158.45 266.886-161.307 295.882 9.135 9.108 38.993 25.06 71.976 38.67l38.104-59.366 12.45-1.59c90.516-11.614 146.566-93.076 146.566-161.9h53.895c0 88.334-68.797 192.243-180.87 213.343l-48.398 75.398-20.292-7.437C53.895 557.757 53.895 523.318 53.895 512c0-50.041 37.025-254.733 215.579-365.622V62.491l22.528-3.746c1.185-.188 29.48-4.85 58.314-4.85 41.553 0 80.842 39.289 80.842 80.842v27.513C679.855 172.813 1024 327.545 1024 646.737 1024 832.189 892.982 1024 673.684 1024m-13.473-323.368c-36.514 0-67.369 49.367-67.369 107.79 0 85.746 68.096 145.084 89.465 161.549 91.54-2.534 164.38-45.488 213.828-107.655H700.632V808.42H930.87c8.92-17.273 16.357-35.355 22.285-53.895H713.27l-6.467-17.65c-.512-1.294-14.363-36.244-46.592-36.244m-175.158 230.48c33.926 14.067 70.52 26.597 114.607 33.47-30.235-36.272-60.713-89.358-60.713-156.16 0-90.652 53.275-161.685 121.264-161.685 44.76 0 73.835 28.78 88.683 53.895h217.007c2.776-17.867 4.204-35.921 4.204-53.895 0-38.94-5.659-74.752-15.926-107.628L827.473 665.79l-38.104-38.104 142.633-142.632a368 368 0 0 0-57.775-81.597L719.683 557.999l-38.103-38.103 153.573-153.573a538 538 0 0 0-82.594-56.752L611.894 450.21l-38.104-38.104 128.135-128.135a794.7 794.7 0 0 0-162.978-52.924v92.321c0 50.15-11.102 156.7-95.932 236.329 18.378 23.417 42.038 63.407 42.038 113.987zM215.579 431.158v-53.895c39.774 0 53.895-29.022 53.895-53.895h53.894c0 53.572-37.025 107.79-107.79 107.79"/></svg>`,
    snake: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M671.528 788.857c44.329 11.965 89.627 19.564 136.893 19.564 89.169 0 161.684-60.443 161.684-134.737S897.59 538.947 808.421 538.947c-19.079 0-37.026 1.51-54.218 4.016-.755-101.403-38.211-172.356-79.414-219.648l-1.105.053a1750 1750 0 0 1-79.036-1.751c45.702 35.867 108.705 107.87 105.984 232.367 0 .431-.081.808-.108 1.24-34.924 10.994-66.156 26.731-95.097 45.19a163 163 0 0 0-15.846-42.388c-21.557-39.64-60.065-66.775-97.36-93.022C433.098 423.344 377.263 384 377.263 296.42c0-130.29 108.275-188.632 215.58-188.632 64.134 0 132.715 12.046 214.365 37.808-4.877 34.654-27.109 63.784-106.576 69.039v-52.952h-53.895v53.68c-63.273-1.025-104.529-5.201-104.987-5.255l-5.578 53.598c2.236.242 56.185 5.767 137.512 5.767 125.17 0 188.632-48.128 188.632-143.064v-19.429l-18.432-6.144c-96.095-32.013-175.859-46.942-251.042-46.942-158.666 0-269.474 99.732-269.474 242.526 0 115.55 76.423 169.391 137.836 212.615 33.684 23.713 65.51 46.107 81.004 74.698 9.54 17.543 13.285 33.415 12.342 47.75 21.154 9.109 42.119 17.84 62.949 25.978 53.652-37.268 112.478-64.62 190.922-64.62 59.446 0 107.79 36.271 107.79 80.842s-48.344 80.842-107.79 80.842c-105.472 0-203.237-42.388-297.768-83.429-94.801-41.094-184.347-79.953-281.412-79.953-106.523.027-175.346 53.572-175.346 136.435 0 79.064 67.099 136.434 159.555 136.434 142.174 0 230.427-66.883 306.796-129.886 31.42 13.42 62.787 26.058 94.45 37.134-47.077 49.637-110.969 82.566-186.61 91.27l5.066 53.626c93.453-7.007 143.144 9.35 195.719 26.543 46.457 15.225 94.127 30.855 169.822 30.855 19.995 0 41.957-1.078 66.344-3.558l-5.416-53.625c-105.283 10.78-158.1-6.548-213.935-24.872-22.15-7.276-44.625-14.633-70.306-20.345a334.9 334.9 0 0 0 96.148-82.298M213.45 810.12c-50.877 0-105.66-25.843-105.66-82.54 0-60.847 62.733-82.54 121.451-82.54 77.851 0 154.732 30.289 235.25 64.943-66.263 52.925-139.721 100.137-251.04 100.137"/></svg>`,
    horse: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M1024 0v404.21c0 33.334 0 134.737-92.08 134.737h-13.823l-78.363-109.056c-22.744 49.907-40.34 103.047-53.49 162.951h115.092c35.974 0 68.77 32.795 68.77 68.797 0 60.631-69.39 154.3-77.313 164.756l-43.008-32.472c25.681-34.061 66.426-100.11 66.426-132.284 0-5.983-8.92-14.902-14.902-14.902H775.976c-14.848 89.384-21.45 193.832-21.45 323.368h-53.894c0-283.971 31.097-453.605 110.888-605.049l20.318-38.535L944.64 483.517c14.444-4.42 25.465-20.938 25.465-79.306V0zM862.316 161.684h53.895V0h-53.895v80.842c-17.381-14.956-38.185-26.947-80.842-26.947H646.737v53.894h134.737c37.672 0 80.842 40.907 80.842 53.895m-107.79 0H538.947v53.895h161.685zm-453.632 604.86 99.786 149.667h64.755l-95.043-142.552 128.485-126.922h167.855a1213 1213 0 0 1 9.431-53.895H476.78zm109.973-184.4-37.862-38.32-132.419 130.803c-66.856-103.531-78.902-144.815-78.902-205.312 0-70.736 37.78-145.947 107.79-145.947h323.368l53.895-53.894H269.474c-6.71 0-13.258.566-19.699 1.482-14.848-21.504-45.137-55.377-89.142-55.377C65.967 215.579 0 349.292 0 469.315c0 70.171 16.141 136.65 49.233 202.672L6.198 723.833l41.472 34.412 66.129-79.737-8.704-16.034c-21.99-40.34-51.2-104.26-51.2-193.159 0-100.864 52.87-199.841 106.738-199.841 13.231 0 25.816 9.89 35.436 20.534-53.194 31.96-88.28 98.492-88.28 179.307 0 78.202 19.699 130.938 93.643 243.982l-55.296 54.622 134.763 202.186h64.755L215.606 775.033z"/></svg>`,
    goat: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M608.256 144.734c-52.493-29.157-102.157-36.945-123.203-36.945V53.895c32.579 0 91.27 11.452 149.369 43.735 75.29 41.823 130.695 94.532 171.385 150.879-49.933 39.504-108.706 74.86-159.07 74.86h-107.79v-53.895h107.79c20.507 0 48.424-11.21 80.438-31.286a471 471 0 0 0-118.919-93.454m224.418 197.498c-16.384 0-29.642 10.24-29.642 44.463 0 34.25 13.23 44.463 29.642 44.463s29.642-10.213 29.642-44.463c0-34.223-13.231-44.463-29.642-44.463M1024 619.789c0-272.68-122.934-497.34-337.246-616.394L660.588 50.5c253.736 140.962 304.1 389.902 309.06 542.343H885.14c-17.92-35.624-45.352-69.12-87.013-101.996l-16.788-13.285-16.734 13.393c-66.13 52.898-134.63 127.084-187.312 209.678H102.966l-8.273-20.319c64.35-63.3 66.991-77.204 66.991-195.26v-53.895h485.053v-53.895H161.684c0-80.384 14.31-110.026 66.587-137.916l-25.384-47.536c-79.522 42.416-95.098 100.11-95.098 185.452v107.79c0 107.6 0 107.6-63.65 169.283L31.07 667.001l79.549 195.315h58.206l-43.897-107.79h103.478l43.897 107.79h58.206l-43.897-107.79h259.476c-37.106 70.414-61.035 144.627-61.035 215.58h53.894c0-68.69 27.271-144.061 68.959-215.58h79.252c7.41 0 13.474 6.063 13.474 13.474v94.316h53.894V768c0-37.16-30.208-67.368-67.368-67.368h-44.652c40.771-58.018 89.438-111.428 138.914-153.627 60.092 53.032 80.896 108.22 80.896 207.521h53.895c0-38.912-2.75-74.482-11.103-107.79H1024z"/></svg>`,
    monkey: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M538.947 1024h-53.894c0-32.795 25.87-87.417 77.446-103.316-33.9-39.532-77.446-98.25-77.446-139.21 0-44.571 36.27-80.842 80.842-80.842h80.842v53.894h-80.842a26.947 26.947 0 0 0-26.948 26.948c0 19.725 36.676 77.473 92.133 134.737h88.603c20.21-14.148 88.738-71.465 88.738-198.603 0-108.382-93.238-202.967-168.152-278.986-49.502-50.203-88.576-89.842-98.735-128.62-11.749-44.732-21.585-112.586-26.327-148.318H377.263c-45.137 0-89.519 8.435-121.802 53.895h175.697v53.895c-97.28 0-107.79 113.07-107.79 161.684v53.895h53.895v161.684h-53.895v-107.79h-26.947c-170.253 0-188.632-94.235-188.632-134.736 0-31.044 35.22-72.327 55.728-93.723 2.694-14.687 5.847-28.35 9.431-41.014h-11.264v-53.895h31.529c46.43-94.585 124.011-107.79 184.05-107.79h185.64l2.803 23.795c.135 1.05 12.72 106.658 27.945 164.756 6.494 24.873 44.624 63.515 84.965 104.448 81.866 83.025 183.7 186.341 183.7 316.82 0 92.376-31.124 155.029-61.898 194.426 104.502-19.887 169.687-109.03 169.687-238.35 0-91.405-42.82-154.381-84.237-215.255-38.077-55.97-77.447-113.853-77.447-188.955 0-119.35 87.094-161.685 161.684-161.685v53.895c-32.417 0-107.79 10.51-107.79 107.79 0 58.502 31.556 104.933 68.097 158.639C974.282 492.598 1024 565.679 1024 673.684c0 177.287-108.301 296.421-269.474 296.421H592.842c-37.672 0-53.895 40.906-53.895 53.895M229.214 269.474a385 385 0 0 0-14.012 58.34l-1.402 8.49-6.09 6.116c-22.878 22.932-44.813 52.601-46.026 62.276 0 56.805 53.76 75.264 107.79 79.387v-52.925c0-58.691 13.473-119.62 46.51-161.684zM323.368 1024h-53.894c0-32.795 25.87-87.417 77.446-103.316-33.9-39.532-77.446-98.25-77.446-139.21 0-44.571 36.27-80.842 80.842-80.842h45.164a188.85 188.85 0 0 1 170.415-107.79h134.737v53.895H565.895c-74.294 0-134.737 60.443-134.737 134.737v26.516l-53.895.377v-26.893c0-9.162.647-18.136 1.913-26.948h-28.86c-14.848 0-26.948 12.073-26.948 26.948 0 19.725 36.676 77.473 92.133 134.737h15.657v53.894h-53.895c-37.672 0-53.895 40.906-53.895 53.895"/></svg>`,
    rooster: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M673.684 354.358c-16.384 0-29.642-10.213-29.642-44.463 0-34.223 13.231-44.463 29.642-44.463s29.642 10.24 29.642 44.463c0 34.25-13.258 44.463-29.642 44.463M540.106 970.105l-50.58-107.79h156.052l50.607 107.79h59.554l-51.604-109.918C811.52 846.82 916.21 764.55 916.21 646.737c0-53.033-11.911-95.42-24.523-140.315-14.443-51.389-29.372-104.529-29.372-183.054V107.79C862.316 48.344 813.972 0 754.526 0a107.924 107.924 0 0 0-107.79 106.173 101 101 0 0 0-24.117-3.315 88.71 88.71 0 0 0-88.603 88.603c0 20.669 5.228 39.72 10.671 53.922l-99.49 59.688 93.75 14.47v57.722c0 14.417-5.901 21.693-33.36 49.152l-11.13 11.13C398.228 326.52 324.985 269.473 215.741 269.473 96.768 269.474 0 366.242 0 485.214v161.523h53.895V485.214A162.01 162.01 0 0 1 215.74 323.368c82.081 0 140.422 36.245 240.64 152.253l-38.616 38.616c-49.96-52.952-94.666-83.08-158.181-83.08a151.983 151.983 0 0 0-151.795 151.795v171.574h53.895V582.952a98.01 98.01 0 0 1 97.9-97.9c46.323 0 79.63 20.912 137.027 86.017l18.971 21.53 128.081-128.08c28.537-28.538 49.18-49.152 49.18-87.256v-97.927l23.309-14.12-13.663-23.04c-.161-.243-14.578-24.9-14.578-50.688 0-19.133 15.575-34.708 34.708-34.708 5.093 0 26.786 3.18 39.559 18.647l26.327 46.026 39.775-24.09-20.373-49.368c-3.152-7.545-7.275-30.478-7.275-40.206 0-29.722 24.171-53.894 53.894-53.894s53.895 24.172 53.895 53.894v215.58c0 85.935 16.68 145.3 31.367 197.631 12.1 43.008 22.528 80.142 22.528 125.737 0 95.286-99.41 161.684-188.632 161.684H464.222l-68.42-145.704c-20.56-43.763-57.693-69.875-99.354-69.875a80.977 80.977 0 0 0-80.87 80.87v188.604h53.896V673.71c0-14.875 12.1-26.974 26.974-26.974 20.534 0 38.966 14.147 50.553 38.858l133.578 284.51z"/></svg>`,
    dog: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M326.063 282.947c0 34.25-13.231 44.464-29.642 44.464s-29.642-10.214-29.642-44.464c0-34.223 13.231-44.463 29.642-44.463s29.642 10.24 29.642 44.463m-56.59 147.349v311.646L190.276 916.21h59.204l73.89-162.574V377.263H296.42c-119.404 0-172.733-53.383-185.506-107.79h35.625c51.092 0 68.58-15.764 120.535-62.544 12.773-11.507 28.08-25.277 47.024-41.742l18.35-15.952-69.658-99.14-44.086 30.99 41.768 59.472c-11.183 9.863-20.884 18.594-29.48 26.328-50.257 45.272-54.757 48.694-84.453 48.694H53.895v26.947c0 88.711 66.91 178.15 215.579 187.77M486.185 268.88c2.29 71.734 28.7 136.327 75.049 182.919 57.479 57.829 141.204 87.147 248.859 87.147 18.593 0 36.19-1.158 52.628-3.449 3.746 111.266 33.63 170.334 51.496 196.015l-38.507 84.723c-93.535-74.186-186.934-115.604-498.446-115.604v53.894c34.277 0 65.698.512 94.64 1.51l-97.308 214.07H433.8l96.013-211.241c66.183 4.338 117.006 11.83 157.912 22.016L626.23 916.21h59.176l54.165-119.135c47.616 18.405 79.737 42.092 113.125 69.74l-46.943 103.29h59.204l113.07-248.779-13.823-13.204c-.485-.458-45.65-47.59-47.94-185.263C985.17 498.553 1024 447.81 1024 377.263c0-95.205-66.506-161.684-161.684-161.684v53.895c65.482 0 107.79 42.307 107.79 107.79 0 89.087-87.014 107.789-160.014 107.789-92.753 0-163.625-23.984-210.648-71.276-30.316-30.505-45.891-65.833-53.356-98.735 11.21 6.952 22.933 13.339 35.275 19.186l23.04-48.72C512.296 241.852 455.41 156.86 385.159 41.525l-46.026 28.052c49.448 81.246 92.968 148.507 147.051 199.303"/></svg>`,
    pig: `<svg fill="${RGBA_WHITE4}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M808.421 700.632v53.894c-196.446 0-323.368 84.642-323.368 215.58h-53.895c0-163.706 148.076-269.474 377.263-269.474m-323.368 107.79v-53.896c-158.343 0-245.599 0-319.65-49.367l-6.79-4.527h-77.77c-21.694 0-26.625-14.821-26.948-26.948v-82.62C138.05 579.88 215.579 516.15 215.579 404.21V215.579h-53.895v161.684h-26.947C67.773 377.263 0 414.29 0 485.053h53.895c0-42.631 52.87-53.895 80.842-53.895h24.63c-12.234 73.755-74.213 107.79-132.42 107.79H0v134.736c0 32.499 21.53 80.842 80.842 80.842h61.683c32.687 20.507 67.126 33.146 105.957 41.014a232.9 232.9 0 0 0-32.903 120.67h53.895c0-41.93 14.012-80.303 39.424-112.505 49.987 4.447 107.062 4.716 176.155 4.716M412.106 466l-88.738 88.738V431.158h-53.894V684.84L450.21 504.104zm-88.738-304.317h-53.894v190.033a770 770 0 0 1 53.894-49.098zm323.369-53.895c-72.623 0-146.81 23.337-215.58 58.638v-58.638h-53.894v154.14c81.57-56.536 178.068-100.245 269.474-100.245 148.588 0 269.474 120.886 269.474 269.474v235.655L809.58 862.316h61.359l99.166-181.76V431.158c0-178.31-145.057-323.369-323.368-323.369"/></svg>`
  };
  var chinese_hour_animals_default = ChineseHourAnimals;

  // lib/ui/image/utils/get-chinese-hour-animal.js
  var getChineseHourAnimal = (hour) => {
    const map = [
      "rat",
      "ox",
      "ox",
      "tiger",
      "tiger",
      "rabbit",
      "rabbit",
      "dragon",
      "dragon",
      "snake",
      "snake",
      "horse",
      "horse",
      "goat",
      "goat",
      "monkey",
      "monkey",
      "rooster",
      "rooster",
      "dog",
      "dog",
      "pig",
      "pig",
      "rat"
    ];
    return map[hour];
  };
  var get_chinese_hour_animal_default = getChineseHourAnimal;

  // lib/ui/image/render-chinese-hour-animal-image.js
  var renderChineseHourAnimalImage = () => {
    const { gameBoard: gameBoard2, gameBoardContext: ctx } = canvas_default;
    const { width } = gameBoard2;
    const time = /* @__PURE__ */ new Date();
    const hour = time.getHours();
    const animal = get_chinese_hour_animal_default(hour - 1);
    const img = getImage(chinese_hour_animals_default[animal]);
    const size = Math.floor(width * 0.38);
    const x = -size / 2;
    const y = -size / 2;
    render_image_default(ctx, img, x, y, size);
  };
  var render_chinese_hour_animal_image_default = renderChineseHourAnimalImage;

  // lib/ui/effects/clock/render-clock-dial.js
  var renderClockDial = (radius, theme) => {
    const { gameBoardContext: ctx } = canvas_default;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = theme.face;
    ctx.fill();
    ctx.lineWidth = Math.floor(radius * 0.2);
    ctx.strokeStyle = theme.stroke;
    ctx.stroke();
    ctx.restore();
  };
  var render_clock_dial_default = renderClockDial;

  // lib/ui/effects/clock/render-clock-ticks.js
  var renderClockTicks = (radius, theme) => {
    const { gameBoardContext: ctx } = canvas_default;
    const dotRadius = Math.floor(radius * 0.06);
    const dotDistance = radius - Math.floor(radius * 0.25);
    for (let i = 0; i < 12; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 6);
      ctx.beginPath();
      ctx.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = theme.stroke;
      ctx.fill();
      ctx.restore();
    }
  };
  var render_clock_ticks_default = renderClockTicks;

  // lib/ui/effects/clock/render-clock-hands.js
  var renderClockHands = (radius, angles, theme) => {
    const { gameBoardContext: ctx } = canvas_default;
    const { hAng, mAng, sAng } = angles;
    ctx.save();
    ctx.rotate(hAng);
    ctx.lineWidth = 5;
    ctx.strokeStyle = theme.stroke;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.4);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(mAng);
    ctx.lineWidth = 4;
    ctx.strokeStyle = theme.stroke;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.65);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(sAng);
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.secondHand;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.75);
    ctx.stroke();
    ctx.restore();
  };
  var render_clock_hands_default = renderClockHands;

  // lib/ui/effects/clock/render-clock-center.js
  var renderClockCenter = (radius, theme) => {
    const { gameBoardContext: ctx } = canvas_default;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = theme.secondHand;
    ctx.arc(0, 0, Math.floor(radius * 0.05), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  var render_clock_center_default = renderClockCenter;

  // lib/ui/effects/clock/utils/get-chinese-hour-dial-theme.js
  var getChineseHourDialTheme = (hour) => {
    const map = [
      "Red",
      "White",
      "White",
      "Orange",
      "Orange",
      "Cyan",
      "Cyan",
      "Blue",
      "Blue",
      "Coral",
      "Coral",
      "Purple",
      "Purple",
      "Green",
      "Green",
      "Yellow",
      "Yellow",
      "Pink",
      "Pink",
      "Teal",
      "Teal",
      "Violet",
      "Violet",
      "Red"
    ];
    return map[hour];
  };
  var get_chinese_hour_dial_theme_default = getChineseHourDialTheme;

  // lib/ui/effects/clock/render-analog-clock.js
  var renderAnalogClock = (time) => {
    const { gameBoard: gameBoard2, gameBoardContext: ctx } = canvas_default;
    const { width, height } = gameBoard2;
    const centerX = width / 2;
    const centerY = height / 2.2;
    const radius = Math.floor(width * 0.3);
    const displayTime = time || /* @__PURE__ */ new Date();
    const hours = displayTime.getHours();
    const angles = get_clock_angles_default(displayTime);
    const theme = clock_themes_default[get_chinese_hour_dial_theme_default(hours)];
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.lineCap = "round";
    render_clock_dial_default(radius, theme);
    render_chinese_hour_animal_image_default();
    render_clock_ticks_default(radius, theme);
    render_clock_hands_default(radius, angles, theme);
    render_clock_center_default(radius, theme);
    ctx.restore();
  };
  var render_analog_clock_default = renderAnalogClock;

  // lib/ui/constants/images/chinese-hour-characters.js
  var { RGBA_TEAL: RGBA_TEAL3 } = colors_default;
  var ChineseHourCharacters = {
    zi: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M538.947 700.632v-215.58h269.474v-53.894H538.947v-39.586c26.544-18.081 94.586-65.05 177.853-127.488l-16.168-48.505H323.368v53.895h295.317a4221 4221 0 0 1-121.64 85.369l-11.992 8.003v68.312H242.526v53.895h242.527v215.579c0 48.343-13.851 53.894-134.737 53.894v53.895c105.39 0 188.631 0 188.631-107.79"/></svg>`,
    chou: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M808.421 700.632H648.866c13.985-172.814 43.115-357.43 70.817-385.16l-19.051-45.998H323.368v53.894h107.17c-1.94 45.757-8.192 103.963-15.764 161.685h-91.406v53.894h83.968c-9.862 68.447-20.264 130.13-25.734 161.685H215.579v53.894H808.42zM461.878 538.947h149.8a3314 3314 0 0 0-16.842 161.685H436.36c6.036-35.248 16.114-95.637 25.519-161.685m22.609-215.579h171.735c-15.198 41.122-27.405 100.595-36.89 161.685H469.207c7.383-57.506 13.42-115.362 15.279-161.685"/></svg>`,
    yin: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M712.677 811.25l-107.79-53.894-24.117 48.209 107.79 53.894zm-269.474-5.658-24.118-48.21-107.789 53.895 24.118 48.21zm257.429-374.434H538.947v-53.895h107.79v-53.895H377.263v53.895h107.79v53.895H323.368v323.368h53.895v-53.894h269.474v53.894h53.895zM538.947 592.842h107.79v53.895h-107.79zm-161.684 0h107.79v53.895h-107.79zm161.684-107.79h107.79v53.895h-107.79zm-161.684 0h107.79v53.895h-107.79zM754.526 215.58H531.43l-20.803-62.41-51.12 17.058 15.118 45.352h-205.15v107.79h53.894v-53.895h377.264v53.894h53.894z"/></svg>`,
    mao: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M592.842 323.368h107.79v323.369c-20.48 0-39.936-11.264-40.017-11.318l-27.73 46.215c3.208 1.94 32.661 18.998 67.747 18.998 30.747 0 53.894-23.148 53.894-53.895V269.474H538.947V808.42h53.895zm-107.79 242.527V323.368h-53.894v196.905l-107.79 40.42V316.767l169.095-48.316-14.82-51.82-208.17 59.473v304.801l-36.405 13.663 18.917 50.472 178.742-67.018c-5.04 69.928-55.27 106.981-165.134 122.934l7.734 53.329c52.386-7.626 211.726-30.747 211.726-188.39"/></svg>`,
    chen: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M471.983 777.62l-40.825-23.094V485.053h-66.075c-14.47 110.646-44.355 197.066-102.696 260.742l-39.748-36.432c83.887-91.487 100.73-246.461 100.73-466.837V215.58h377.263v53.895h-323.45c-.404 58.26-2.21 112.128-6.36 161.684h329.81v53.895H578.479a481.2 481.2 0 0 0 76.827 119.7l66.48-39.855 27.728 46.214-54.46 32.688c29.507 24.953 63.757 45.675 102.804 58.098l-16.303 51.362C647.33 710.548 558.78 586.186 520.003 485.053h-34.95V706.91l68.985-41.39 27.729 46.214zm174.754-400.357h-215.58v-53.895h215.58z"/></svg>`,
    si: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M728.064 692.763l-52.116-13.797c-18.729 70.898-24.522 75.56-56.159 75.56H377.263V485.053h269.474v53.894h53.895V215.58H323.368v538.947c0 29.723 24.172 53.895 53.895 53.895H619.79c77.69 0 91.19-51.065 108.275-115.658m-350.8-423.29h269.473v161.685H377.263z"/></svg>`,
    wu: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512m-431.158 26.947h269.474v-53.894H538.947V323.368h161.685v-53.894h-289.63c12.045-33.28 20.156-69.794 20.156-107.79h-53.895c0 121.964-105.364 233.391-106.415 234.496l38.858 37.35c2.883-3.019 43.817-46.135 77.393-110.162h97.954v161.685H215.579v53.894h269.474v323.369h53.894z"/></svg>`,
    wei: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512m-431.158 50.203c52.305 70.925 136.974 152.145 232.53 190.383l19.994-50.041c-109.271-43.709-202.806-152.63-238.78-217.492h255.73v-53.895H538.947v-53.895h215.58v-53.895h-215.58V161.684h-53.894v161.684h-215.58v53.895h215.58v53.895H215.579v53.895h255.757C435.362 549.915 341.8 658.836 232.53 702.545l20.022 50.041c95.528-38.238 180.197-119.485 232.502-190.383V808.42h53.894z"/></svg>`,
    shen: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M538.947 646.737h161.685v53.895h53.894V269.474H538.947v-107.79h-53.894v107.79h-215.58v431.158h53.895v-53.895h161.685v215.579h53.894zm0-161.684h161.685v107.79H538.947zm-215.579 0h161.685v107.79H323.368zm215.58-161.685h161.684v107.79H538.947zm-215.58 0h161.685v107.79H323.368z"/></svg>`,
    you: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M754.526 323.368H592.842v-26.947h161.684v-53.895H269.474v53.895h161.684v26.947H269.474v485.053h53.894v-53.895h377.264v53.895h53.894zM323.368 646.737h377.264v53.895H323.368zm0-269.474h107.79c0 103.316-72.785 107.655-81.085 107.79l.243 53.894c46.592 0 134.737-33.792 134.737-161.684h53.894v107.79c0 29.723 24.172 53.894 53.895 53.894h107.79v53.895H323.368zm377.264 0v107.79h-107.79v-107.79zm-215.58-80.842h53.895v26.947h-53.894z"/></svg>`,
    xu: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="M970.105 512c0 224.984-163.166 412.187-377.263 450.533v-54.46C777.135 870.507 916.211 707.206 916.211 512c0-222.882-181.33-404.21-404.211-404.21S107.79 289.117 107.79 512 289.117 916.21 512 916.21c9.081 0 18-.754 26.947-1.374v53.895c-8.973.539-17.866 1.374-26.947 1.374-252.605 0-458.105-205.5-458.105-458.105S259.395 53.895 512 53.895 970.105 259.395 970.105 512M594.513 662.393c33.684 44.544 75.21 74.698 124.74 90.813l11.425 3.719 10.402-6.01c40.124-23.174 67.341-128.35 67.341-158.073h-53.895c0 22.07-19.132 80.87-33.71 103.505-34.817-14.606-64.54-39.262-89.25-74.132 48.316-55.27 92.079-117.33 120.535-179.9l-49.044-22.286C679.289 472.279 643.315 524.746 603 572.685c-24.01-50.93-41.148-115.927-51.658-195.395h149.289v-53.895h-155.19a1848 1848 0 0 1-6.495-161.71h-53.894c0 58.206 2.155 112.073 6.494 161.683H323.368v26.948c0 216.549-13.177 263.545-100.702 359.047l39.747 36.432c63.327-69.093 92.807-118.272 105.715-206.848h116.925v-53.894h-111.32a1742 1742 0 0 0 3.45-107.79H497.34c12.611 98.25 35.031 177.476 67.395 238.188-61.979 65.536-128.054 117.976-173.299 142.282l25.52 47.481c47.589-25.573 114.095-77.446 177.556-142.82m125.17-411.971-80.842-80.842-38.103 38.103 80.842 80.842z"/></svg>`,
    hai: `<svg fill="${RGBA_TEAL3}" xmlns="http://www.w3.org/2000/svg" width="800" height="800" class="icon" viewBox="0 0 1024 1024"><path d="m309.976 804.756-27.136-46.592c103.073-60.012 183.026-132.473 241.475-219.244h-174l-13.473-50.283c58.88-33.981 99.436-117.572 118.703-165.296H242.526v-53.894h538.948v53.894h-268.18c-12.396 34.089-42.47 106.604-90.436 161.685h134.01a680.6 680.6 0 0 0 46.349-107.709l51.092 17.058c-58.422 175.265-171.035 309.49-344.333 410.381m192.35-2.937-34.52-41.364c88.415-73.728 154.517-158.774 202.106-259.908l48.801 22.96a797.4 797.4 0 0 1-82.35 137.781c32.74 15.01 83.455 44.868 137.646 101.592l-38.939 37.268c-57.236-59.877-109.325-85.558-133.766-95.178a851 851 0 0 1-98.978 96.849m48.613-536.872-80.842-53.895 29.884-44.84 80.843 53.894zM512 53.895c-252.605 0-458.105 205.5-458.105 458.105S259.395 970.105 512 970.105c9.081 0 17.974-.835 26.947-1.374v-53.895c-8.946.62-17.866 1.375-26.947 1.375-222.882 0-404.21-181.33-404.21-404.211S289.117 107.79 512 107.79 916.21 289.117 916.21 512c0 195.207-139.075 358.508-323.368 396.045v54.461c214.097-38.346 377.263-225.55 377.263-450.533 0-252.578-205.5-458.078-458.105-458.078"/></svg>`
  };
  var chinese_hour_characters_default = ChineseHourCharacters;

  // lib/ui/image/utils/get-chinese-hour-character.js
  var getChineseHourCharacter = (hour) => {
    const map = [
      "zi",
      "chou",
      "chou",
      "yin",
      "yin",
      "mao",
      "mao",
      "chen",
      "chen",
      "si",
      "si",
      "wu",
      "wu",
      "wei",
      "wei",
      "shen",
      "shen",
      "you",
      "you",
      "xu",
      "xu",
      "hai",
      "hai",
      "zi"
    ];
    return map[hour];
  };
  var get_chinese_hour_character_default = getChineseHourCharacter;

  // lib/ui/image/render-chinese-hour-character-image.js
  var renderChineseHourCharacterImage = () => {
    const { gameBoard: gameBoard2, gameBoardContext: ctx } = canvas_default;
    const { width, height } = gameBoard2;
    const time = /* @__PURE__ */ new Date();
    const hour = time.getHours();
    const character = get_chinese_hour_character_default(hour);
    const img = getImage(chinese_hour_characters_default[character]);
    let size;
    let x;
    let y;
    if (hour >= 0 && hour <= 3) {
      size = Math.floor(width * 0.48);
      x = width - size * 0.7;
      y = height / 2 - size * 1.4;
    } else if (hour > 3 && hour <= 7) {
      size = Math.floor(width * 0.52);
      x = width - size * 1.1;
      y = height / 2 - size * 1.7;
    } else if (hour > 7 && hour <= 11) {
      size = Math.floor(width * 0.58);
      x = width - size * 1.2;
      y = height / 2 - size * 1.75;
    } else if (hour > 11 && hour <= 14) {
      size = Math.floor(width * 0.68);
      x = width / 2 - size / 2;
      y = -size * 0.1;
    } else if (hour > 14 && hour <= 16) {
      size = Math.floor(width * 0.58);
      x = size * 0.2;
      y = height / 2 - size * 1.75;
    } else if (hour > 16 && hour <= 19) {
      size = Math.floor(width * 0.52);
      x = size * 0.1;
      y = height / 2 - size * 1.7;
    } else {
      size = Math.floor(width * 0.48);
      x = -size * 0.3;
      y = height / 2 - size * 1.4;
    }
    render_image_default(ctx, img, x, y, size);
  };
  var render_chinese_hour_character_image_default = renderChineseHourCharacterImage;

  // lib/ui/board/render-board.js
  function renderBoard(board) {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const { gameBoardContext: gameBoardContext2 } = canvas_default;
    clear_board_default();
    render_chinese_hour_character_image_default();
    render_scene_background_default("playing");
    for (let y = 0; y < ROWS2; y++) {
      for (let x = 0; x < COLS2; x++) {
        if (board[y][x]) {
          render_block_default(gameBoardContext2, x, y, board[y][x]);
        }
      }
    }
  }
  var render_board_default = renderBoard;

  // lib/ui/board/render-active-pieces.js
  var renderActivePieces = (curr, cx, cy) => {
    const { gameBoardContext: ctx } = canvas_default;
    const { shape, color } = curr;
    const { length } = shape;
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          render_block_default(ctx, cx + x, cy + y, color);
        }
      }
    }
    return true;
  };
  var render_active_pieces_default = renderActivePieces;

  // lib/ui/board/render-active-only.js
  var renderActiveOnly = (state) => {
    const { board, curr, cx, cy } = state;
    if (board) {
      render_board_default(board);
    }
    if (curr) {
      render_active_pieces_default(curr, cx, cy);
    }
  };
  var render_active_only_default = renderActiveOnly;

  // lib/ui/scenes/paused-scene/render-paused.js
  var renderPaused = (state) => {
    clear_board_default();
    render_active_only_default(state);
    render_overlay_default();
    render_scene_background_default("paused");
    render_tetris_text_default();
    render_digital_clock_default();
    render_analog_clock_default();
    render_paused_text_default();
  };
  var render_paused_default = renderPaused;

  // lib/ui/scenes/paused-scene/index.js
  var pausedScene = (state) => {
    render_paused_default(state);
  };
  var paused_scene_default = pausedScene;

  // lib/ui/text/render-game-text.js
  var renderGameText = () => {
    const { RED: RED5, YELLOW: YELLOW5 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "GAME",
      x: width / 2,
      y: height / 1.8,
      color: RED5,
      strokeColor: YELLOW5,
      size: 2.3,
      center: true,
      stroke: true
    });
  };
  var render_game_text_default = renderGameText;

  // lib/ui/text/render-over-text.js
  var renderOverText = () => {
    const { RED: RED5, YELLOW: YELLOW5 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    render_text_default({
      text: "OVER",
      x: width / 2,
      y: height / 1.6,
      color: RED5,
      strokeColor: YELLOW5,
      size: 2.3,
      center: true,
      stroke: true
    });
  };
  var render_over_text_default = renderOverText;

  // lib/ui/scenes/game-over-scene/render-game-over.js
  var renderGameOver = (state) => {
    clear_board_default();
    render_active_only_default(state);
    render_overlay_default();
    render_scene_background_default("game-over");
    render_tetris_text_default();
    render_game_text_default();
    render_over_text_default();
    render_enter_start_text_default();
  };
  var render_game_over_default = renderGameOver;

  // lib/ui/scenes/game-over-scene/index.js
  var gameOverScene = (state) => {
    render_game_over_default(state);
  };
  var game_over_scene_default = gameOverScene;

  // lib/ui/scenes/playing-scene/render-playing.js
  var renderPlaying = (state) => {
    render_active_only_default(state);
    render_next_piece_default(state);
  };
  var render_playing_default = renderPlaying;

  // lib/ui/scenes/playing-scene/index.js
  var playingScene = (state) => {
    render_playing_default(state);
  };
  var playing_scene_default = playingScene;

  // lib/ui/scenes/index.js
  var Scenes = {
    /**
     * ## 主菜单场景
     *
     * @param {object} state 游戏状态
     */
    "main-menu": (state) => {
      main_menu_scene_default(state);
    },
    /**
     * ## 暂停场景
     *
     * @param {object} state 游戏状态
     */
    paused: (state) => {
      paused_scene_default(state);
    },
    /**
     * ## 游戏结束场景
     *
     * @param {object} state 游戏状态
     */
    "game-over": (state) => {
      game_over_scene_default(state);
    },
    /**
     * ## 游戏进行中场景
     *
     * @param {object} state 游戏状态
     */
    playing: (state) => {
      playing_scene_default(state);
    }
  };
  var scenes_default = Scenes;

  // lib/ui/scene-manager/render-scene.js
  var renderScene = (state) => {
    const mode = engine_default.getMode();
    const scene = scenes_default[mode];
    if (!scene) return;
    scene(state);
  };
  var render_scene_default = renderScene;

  // lib/ui/core/resize.js
  var resize = () => {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const { gameBoard: gameBoard2, nextPiece: nextPiece2 } = canvas_default;
    const h = globalThis.innerHeight * 0.9;
    canvas_default.blockSize = Math.floor(h / ROWS2);
    gameBoard2.width = canvas_default.blockSize * COLS2;
    gameBoard2.height = canvas_default.blockSize * ROWS2;
    canvas_default.fontSize = Math.floor(gameBoard2.height * 0.032);
    const nextSize = Math.min(
      globalThis.innerWidth * 0.1,
      globalThis.innerHeight * 0.18
    );
    nextPiece2.width = nextSize;
    nextPiece2.height = nextSize;
  };
  var resize_default = resize;

  // lib/engine/state/set-hud.js
  var setHud = (hud) => {
    const { state } = engine_default;
    const { score, lines, level } = hud;
    state.score = score;
    state.lines = lines;
    set_level_default(level);
  };
  var set_hud_default = setHud;

  // lib/engine/state/get-hud.js
  var getHud = () => {
    const { source, lines, level } = engine_default.state;
    return {
      source,
      lines,
      level
    };
  };
  var get_hud_default = getHud;

  // lib/engine/engine.js
  var Engine = {
    // Runtime 状态
    rafId: null,
    // 时间累积器（用于 fixed update / tick）
    accumulator: 0,
    // 上一帧时间戳
    lastTimestamp: 0,
    // 游戏状态
    state: engine_state_default,
    // 状态管理模块
    resetBoard: reset_board_default,
    getMode: get_mode_default,
    setMode: set_mode_default,
    loadHighScore: load_high_score_default,
    saveHighScore: save_high_score_default,
    setLevel: set_level_default,
    setHud: set_hud_default,
    getHud: get_hud_default,
    /**
     * ## 初始化游戏
     *
     * 执行完整游戏初始化流程：
     *
     * - 重置棋盘
     * - 加载存档
     * - 初始化状态
     * - 绑定输入
     * - 渲染主菜单
     * - 启动 game loop
     */
    launch: () => {
      const { state } = Engine;
      reset_board_default();
      load_high_score_default();
      set_mode_default("main-menu");
      Engine.setHud({
        score: 0,
        lines: 0,
        level: 1
      });
      Engine.resize();
      const { score, lines, level, highScore } = state;
      render_hud_default(score, lines, level, highScore);
      lazy_render_main_menu_default(state);
      bind_events_default();
      Engine.start();
    },
    /** ## 启动主循环 */
    start: () => {
      Engine.rafId = requestAnimationFrame(start_game_loop_default);
    },
    /** ## 停止游戏循环 */
    stop: () => {
      stop_game_loop_default();
    },
    /** ## 重启游戏循环 */
    restart: () => {
      restart_game_loop_default();
    },
    /**
     * ## 渲染阶段
     *
     * 负责 scene 渲染调度
     */
    render: () => {
      render_scene_default(Engine.state);
    },
    /**
     * ## 更新阶段
     *
     * 逻辑更新 + 动画更新（目前仅更新动画）
     *
     * @param {number} delta - 时间间隔
     */
    update: (delta) => {
      updateAnimations(delta);
    },
    /** ## 动画渲染层 */
    animate: () => {
      renderAnimations();
    },
    /**
     * ## 自适应画布
     *
     * Resize 后立即重新渲染
     */
    resize: () => {
      resize_default();
      Engine.render();
    }
  };
  var engine_default = Engine;

  // lib/main.js
  var main = () => {
    preloadImages(scenes_background_default);
    engine_default.launch();
  };
  var main_default = main;

  // lib/tetris.js
  main_default();
})();
