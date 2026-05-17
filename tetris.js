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

  // lib/services/ui/constants/images/scenes-background.js
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

  // lib/configuration.js
  var Configuration = {
    // 请始终保持 min > max
    Level: {
      min: 11,
      max: 99
    },
    Elements: {
      Main: {
        cols: 10,
        rows: 20,
        board: "game-board",
        next: "next-piece"
      },
      Hud: {
        score: "score",
        lines: "lines",
        level: "level",
        highScore: "high-score"
      }
    }
  };
  var configuration_default = Configuration;

  // lib/utils/is-function.js
  var isFunction = (val) => {
    if (val == null || typeof val !== "function" && typeof val !== "object") {
      return false;
    }
    return (
      // 处理某些特殊环境下 typeof 误判为 object 的函数（极少数情况）
      typeof val === "function" || Object.prototype.toString.call(val) === "[object Function]"
    );
  };
  var is_function_default = isFunction;

  // lib/utils/is-string.js
  var isString = (str) => typeof str === "string";
  var is_string_default = isString;

  // lib/core/event-bus/index.js
  var EventBus = {
    events: /* @__PURE__ */ new Map(),
    /**
     * ## 订阅事件
     *
     * @param {string} event - 事件名称
     * @param {Function} handler - 处理函数
     */
    on(event, handler) {
      if (!is_string_default(event) || !is_function_default(handler)) {
        return;
      }
      if (!this.events.has(event)) {
        this.events.set(event, /* @__PURE__ */ new Set());
      }
      this.events.get(event).add(handler);
    },
    /**
     * ## 订阅事件，仅触发一次
     *
     * @param {string} event - 事件名称
     * @param {Function} handler - 处理函数
     */
    once(event, handler) {
      if (!is_string_default(event) || !is_function_default(handler)) {
        return;
      }
      const wrapper = (payload) => {
        try {
          handler(payload);
        } finally {
          this.off(event, wrapper);
        }
      };
      this.on(event, wrapper);
    },
    /**
     * ## 取消订阅
     *
     * @param {string} event - 事件名称
     * @param {Function} handler - 处理函数
     */
    off(event, handler) {
      if (!is_string_default(event) || !is_function_default(handler)) {
        return;
      }
      const set = this.events.get(event);
      if (!set) {
        return;
      }
      set.delete(handler);
      if (set.size === 0) {
        this.events.delete(event);
      }
    },
    /**
     * ## 触发事件
     *
     * @param {string} event - 事件名称
     * @param {object} [payload] - 参数对象
     */
    emit(event, payload) {
      const set = this.events.get(event);
      if (!set) {
        return;
      }
      for (const handler of set) {
        if (!is_function_default(handler)) {
          continue;
        }
        handler(payload);
      }
    },
    /** ## 清空所有事件（用于重启 / 测试 / reset） */
    clear() {
      this.events.clear();
    }
  };
  var event_bus_default = EventBus;

  // lib/engine/scheduler.js
  var Scheduler = class {
    /**
     * ## 构造函数
     *
     * @class
     */
    constructor() {
      this.tasks = /* @__PURE__ */ new Map();
      this.nextId = 1;
      this.dirty = false;
    }
    /**
     * ## 外部 Game Loop 调用
     *
     * @param {number} [gameTime=performance.now()] - 游戏循环时间. Default is
     *   `performance.now()`
     * @returns {void}
     */
    tick(gameTime = performance.now()) {
      if (this.tasks.size === 0) {
        return;
      }
      for (const task of this.tasks.values()) {
        if (task.cancelled) {
          this.dirty = true;
          continue;
        }
        switch (task.type) {
          case "delay": {
            if (task.startTime === void 0) {
              task.startTime = gameTime;
            }
            if (gameTime - task.startTime < task.delay) {
              continue;
            }
            task.fn();
            this.tasks.delete(task.id);
            break;
          }
          case "interval": {
            if (task.startTime === void 0) {
              task.startTime = gameTime;
              task.nextTime = gameTime + task.interval;
            }
            if (gameTime < task.nextTime) {
              continue;
            }
            task.fn();
            task.nextTime = gameTime + task.interval;
            break;
          }
        }
      }
      if (this.dirty) {
        for (const [id, task] of this.tasks) {
          if (!task.cancelled) {
            continue;
          }
          this.tasks.delete(id);
        }
        this.dirty = false;
      }
    }
    /**
     * ## 延迟任务（setTimeout replacement）
     *
     * @param {Function} fn - 执行任务的处理函数
     * @param {number} delay - 执行任务的时间延迟
     * @returns {number} - 返回任务 id
     */
    delay(fn, delay = 0) {
      const id = this.nextId++;
      this.tasks.set(id, {
        id,
        type: "delay",
        delay,
        fn,
        cancelled: false
      });
      return id;
    }
    /**
     * ## 周期任务（setInterval replacement）
     *
     * @param {Function} fn - 执行任务的处理函数
     * @param {number} interval - 执行任务的时间间隔
     * @returns {number} - 返回任务 id
     */
    interval(fn, interval = 1e3) {
      const id = this.nextId++;
      this.tasks.set(id, {
        id,
        type: "interval",
        interval,
        fn,
        cancelled: false
      });
      return id;
    }
    /**
     * ## 任务列队
     *
     * - 执行列队中的一系列任务
     *
     * @param {Array} list - 任务列表数据
     * @returns {Array} - 列队任务的 id 值数组
     */
    sequence(list) {
      const ids = [];
      let t = 0;
      for (const item of list) {
        const { delay = 0, fn } = item;
        t += delay;
        ids.push(this.delay(fn, t));
      }
      return ids;
    }
    /**
     * ## 取消任务
     *
     * 通过任务 id 取消任务
     *
     * @param {number} id - 任务 id
     */
    cancel(id) {
      const task = this.tasks.get(id);
      if (!task) {
        return;
      }
      task.cancelled = true;
      this.dirty = true;
    }
    /**
     * ## 清空所有任务
     *
     * - 清空任务
     * - 恢复 dirty
     */
    clear() {
      this.tasks.clear();
      this.dirty = false;
    }
    /**
     * ## Debug helper
     *
     * 帮助测试用
     *
     * @returns {number} - 返回任务数量
     */
    size() {
      return this.tasks.size;
    }
  };
  var scheduler_default = Scheduler;

  // lib/core/index.js
  var Base = class {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} [deps={}] - （所有）依赖对象. Default is `{}`
     */
    constructor(deps = {}) {
      this.inject(deps);
    }
    inject(deps = {}) {
      Object.assign(this, deps);
    }
    emit(event, payload) {
      event_bus_default.emit(event, payload);
    }
    on(event, handler) {
      event_bus_default.on(event, handler);
    }
    once(event, handler) {
      event_bus_default.once(event, handler);
    }
    off(event, handler) {
      event_bus_default.off(event, handler);
    }
    clear() {
      event_bus_default.clear();
    }
  };
  var core_default = Base;

  // lib/services/audio/constants/motifs.js
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
  var motifs_default = MOTIFS;

  // lib/services/audio/resume-tone.js
  var playTone = (audio, freq, dur, options = {}) => {
    if (!freq || dur <= 0) {
      return;
    }
    const { Context } = audio;
    const {
      // 音量峰值
      volume = 0.15,
      // 默认方波
      wave = "square",
      // 默认连奏，音符唱满时值
      gate = 1,
      // 运音包络
      articulation = {},
      // 默认立即开始
      startTime = Context.currentTime
    } = options;
    const osc = Context.createOscillator();
    const gain = Context.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, startTime);
    const step = dur / 1e3;
    const noteLen = step * gate;
    const {
      attackTime = 3e-3,
      // 起音时间，3ms 快速起音
      releaseTime = 0.02,
      // 释音时间，20ms 平滑收尾
      sustainRatio = 0.9
      // 延音比，保持 90% 峰值音量进入衰减段
    } = articulation;
    const t0 = startTime;
    const t1 = t0 + attackTime;
    const t2 = t0 + Math.max(noteLen - releaseTime, attackTime);
    const t3 = t0 + noteLen;
    gain.gain.setValueAtTime(1e-4, t0);
    gain.gain.linearRampToValueAtTime(volume, t1);
    gain.gain.linearRampToValueAtTime(volume * sustainRatio, t2);
    gain.gain.exponentialRampToValueAtTime(1e-4, t3);
    osc.connect(gain);
    gain.connect(Context.destination);
    osc.start(t0);
    osc.stop(t3 + 0.05);
    osc.addEventListener("ended", () => {
      osc.disconnect();
      gain.disconnect();
    });
  };
  var play_tone_default = playTone;

  // lib/services/audio/sounds.js
  var getMotif = (lines, isPerfectClear = false) => {
    if (isPerfectClear) {
      return "perfect";
    }
    if (lines === 4) {
      return "tetris";
    }
    return "combo";
  };
  var Sounds = class extends core_default {
    constructor(options) {
      super(options);
    }
    // 等级选择音效（正弦波柔和音效）
    LEVEL_CHANGED = () => {
      play_tone_default(this, 520, 80, {
        volume: 0.2,
        wave: "triangle"
      });
    };
    // 主菜单/难度选择场景切换音效
    SWITCH_SCENE = () => {
      play_tone_default(this, 620, 80, {
        volume: 0.2,
        wave: "triangle"
      });
    };
    // 难度选择音效
    DIFFICULTY_CHANGED = () => {
      play_tone_default(this, 880, 80, {
        volume: 0.2,
        wave: "triangle"
      });
    };
    // 等级开始音效
    GAME_STARTED = () => {
      play_tone_default(this, 1319, 160, {
        volume: 0.22,
        wave: "triangle"
      });
    };
    // 开始倒计时音效
    COUNTDOWN = () => {
      play_tone_default(this, 784, 180, {
        volume: 0.4,
        wave: "sine"
      });
    };
    // 方块移动音效
    MOVE = () => play_tone_default(this, 330, 60);
    // 方块旋转音效
    ROTATE = () => play_tone_default(this, 440, 60);
    // 方块快速下落音效
    DROP = () => play_tone_default(this, 220, 100);
    // 方块落地音效
    FALL = () => play_tone_default(this, 180, 200);
    /**
     * ## 消行动效音播放（基于和弦 + 动机系统）
     *
     * 根据消除行数生成不同音乐动机，并播放对应和弦音效
     *
     * @param {number} lines - 消除行数
     * @param {boolean} isPerfectClear - 是否全清
     */
    CLEAR = (lines = 1, isPerfectClear = false) => {
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
      const cfg = motifs_default[motif];
      const index = Math.min(lines, frequencies.length - 1);
      const baseChord = frequencies[index];
      const chord = baseChord.map((freq) => freq + cfg.shift * 12);
      const queue = [];
      for (const [i, freq] of chord.entries()) {
        queue.push({
          fn: () => {
            const now = this.Context.currentTime;
            play_tone_default(this, freq, speeds[i] * cfg.speed, {
              volume: volumes[i] * cfg.volume,
              startTime: now + timeouts[i] / 1e3
            });
          }
        });
      }
      this.Scheduler.sequence(queue);
    };
    // 升级庆祝音效
    LEVEL_UP = () => {
      const now = this.Context.currentTime;
      this.Scheduler.sequence([
        {
          fn: () => {
            play_tone_default(this, 523, 220);
          }
        },
        {
          fn: () => {
            play_tone_default(this, 587, 220, {
              startTime: now + 0.26
            });
          }
        },
        {
          fn: () => {
            play_tone_default(this, 659, 240, {
              startTime: now + 0.52
            });
          }
        },
        {
          delay: 260,
          fn: () => {
            play_tone_default(this, 784, 260, {
              startTime: now + 0.78
            });
          }
        },
        {
          fn: () => {
            play_tone_default(this, 880, 280, {
              startTime: now + 1.06
            });
          }
        },
        {
          fn: () => {
            play_tone_default(this, 1047, 320, {
              startTime: now + 1.36
            });
          }
        },
        {
          fn: () => {
            play_tone_default(this, 1175, 360, {
              startTime: now + 1.7
            });
          }
        },
        {
          fn: () => {
            play_tone_default(this, 1319, 480, {
              startTime: now + 2.08
            });
          }
        }
      ]);
    };
    // 暂停游戏音效
    PAUSED = () => play_tone_default(this, 300, 150);
    // 秒针走动音效
    SECOND_TICK = () => {
      play_tone_default(this, 880, 50, {
        volume: 0.085,
        wave: "triangle"
      });
    };
    // 恢复游戏音效
    RESUME = () => play_tone_default(this, 400, 150);
    // 游戏结束音效（悲伤旋律）
    GAME_OVER = () => {
      const now = this.Context.currentTime;
      this.Scheduler.sequence([
        { fn: () => play_tone_default(this, 330, 200) },
        {
          fn: () => play_tone_default(this, 294, 300, {
            startTime: now + 0.21
          })
        },
        {
          fn: () => play_tone_default(this, 262, 500, {
            startTime: now + 0.52
          })
        }
      ]);
    };
    // 背景音乐开关音效
    BGM_TOGGLED = () => play_tone_default(this, 440, 100);
  };
  var sounds_default = Sounds;

  // lib/services/audio/constants/bgm/tetris-theme.js
  var TetrisTheme = {
    name: "TetrisTheme",
    melody: [
      // === A段：经典律动 (长-短-短) ===
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 494, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 494, dur: 1.2 },
      { freq: 494, dur: 0.4 },
      { freq: 494, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 1.2 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      // === A'段：高音区 ===
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 0.4 },
      { freq: 880, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 494, dur: 1.2 },
      { freq: 494, dur: 0.4 },
      { freq: 494, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 1.2 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      // === B段：下行区 ===
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 494, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 415, dur: 1.2 },
      { freq: 415, dur: 0.4 },
      { freq: 415, dur: 0.4 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 494, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 0.4 },
      { freq: 880, dur: 0.4 },
      // === 结尾收束 ===
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 523, dur: 1.2 },
      { freq: 494, dur: 1.2 },
      { freq: 494, dur: 0.4 },
      { freq: 494, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 1.2 },
      { freq: 523, dur: 1.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 }
    ],
    duration: 220,
    volume: 0.08,
    wave: "square",
    gate: 0.6
  };
  var tetris_theme_default = TetrisTheme;

  // lib/services/audio/constants/bgm/spring-festival.js
  var SpringFestival = {
    name: "Spring Festival",
    melody: [
      // ===== 第一句：秧歌调 =====
      { freq: 523, dur: 0.6 },
      // 啦 (C5)
      { freq: 587, dur: 0.3 },
      // 啦 (D5)
      { freq: 659, dur: 0.9 },
      // 啦～ (E5)
      { freq: 659, dur: 0.6 },
      // 啦
      { freq: 784, dur: 0.3 },
      // 啦
      { freq: 880, dur: 1.2 },
      // 啦～ (A5)
      { freq: 880, dur: 0.6 },
      // 啦
      { freq: 784, dur: 0.3 },
      // 啦
      { freq: 659, dur: 0.9 },
      // 啦～
      { freq: 587, dur: 0.6 },
      // 啦
      { freq: 523, dur: 1.5 },
      // 啦～
      // ===== 第二句：欢腾段落 =====
      { freq: 659, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 880, dur: 0.3 },
      { freq: 880, dur: 0.3 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.3 },
      { freq: 587, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 659, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      // ===== 第三句：再现秧歌，更热烈 =====
      { freq: 523, dur: 0.4 },
      { freq: 587, dur: 0.2 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.2 },
      { freq: 880, dur: 0.8 },
      { freq: 1047, dur: 0.4 },
      // 拔高 (C6)
      { freq: 880, dur: 0.2 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 523, dur: 2 },
      // 收束
      // ===== 第四句：锣鼓模仿 =====
      { freq: 659, dur: 0.2 },
      { freq: 659, dur: 0.2 },
      { freq: 0, dur: 0.1 },
      { freq: 659, dur: 0.2 },
      { freq: 0, dur: 0.1 },
      { freq: 784, dur: 0.2 },
      { freq: 784, dur: 0.2 },
      { freq: 0, dur: 0.1 },
      { freq: 784, dur: 0.2 },
      { freq: 0, dur: 0.1 },
      { freq: 659, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 523, dur: 0.8 },
      { freq: 0, dur: 1 }
      // 段落呼吸
    ],
    duration: 280,
    // 较快节奏
    volume: 0.08,
    wave: "square",
    // 方波更能模拟唢呐/秧歌的热闹感
    gate: 0.7,
    // 轻断奏，颗粒分明
    articulation: {
      attackTime: 3e-3,
      releaseTime: 0.02,
      sustainRatio: 0.5
      // 较低延音比，音符跳跃
    }
  };
  var spring_festival_default = SpringFestival;

  // lib/services/audio/constants/bgm/first-division.js
  var FirstDivision = {
    name: "FirstDivision",
    melody: [
      // === 主动机（进行曲感）===
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      // === 重复推进 ===
      { freq: 659, dur: 0.8 },
      { freq: 698, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 698, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      // === 第二句（上行）===
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 698, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 698, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 1.2 },
      // === 强化段（军乐推进）===
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 698, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      // === 高潮（稳定推进）===
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 988, dur: 1.2 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 698, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      // === 回落（收束）===
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 1.2 },
      // === 循环点 ===
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.6 }
    ],
    duration: 180,
    volume: 0.08,
    wave: "square"
  };
  var first_division_default = FirstDivision;

  // lib/services/audio/constants/bgm/gong-xi-fa-cai.js
  var GongXiFaCai = {
    name: "Gong Xi Fa Cai",
    melody: [
      // ===== 恭喜发财 恭喜发财 =====
      { freq: 523, dur: 0.5 },
      // 恭 (C5)
      { freq: 587, dur: 0.5 },
      // 喜 (D5)
      { freq: 659, dur: 0.8 },
      // 发 (E5)
      { freq: 659, dur: 0.8 },
      // 财～
      { freq: 784, dur: 0.5 },
      // 恭
      { freq: 880, dur: 0.5 },
      // 喜
      { freq: 784, dur: 0.8 },
      // 发
      { freq: 659, dur: 1.5 },
      // 财～
      { freq: 587, dur: 0.5 },
      // 恭
      { freq: 659, dur: 0.5 },
      // 喜
      { freq: 784, dur: 0.8 },
      // 发
      { freq: 784, dur: 0.8 },
      // 财～
      { freq: 880, dur: 0.5 },
      // 恭
      { freq: 1047, dur: 0.5 },
      // 喜 (C6)
      { freq: 880, dur: 0.8 },
      // 发
      { freq: 784, dur: 1.5 },
      // 财～
      // ===== 我恭喜你发财 我恭喜你精彩 =====
      { freq: 659, dur: 0.3 },
      // 我
      { freq: 784, dur: 0.3 },
      // 恭
      { freq: 880, dur: 0.5 },
      // 喜
      { freq: 880, dur: 0.3 },
      // 你
      { freq: 784, dur: 0.3 },
      // 发
      { freq: 659, dur: 1 },
      // 财～
      { freq: 587, dur: 0.3 },
      // 我
      { freq: 659, dur: 0.3 },
      // 恭
      { freq: 784, dur: 0.5 },
      // 喜
      { freq: 784, dur: 0.3 },
      // 你
      { freq: 659, dur: 0.3 },
      // 精
      { freq: 587, dur: 1 },
      // 彩～
      // ===== 最好的请过来 不好的请走开 =====
      { freq: 523, dur: 0.4 },
      // 最
      { freq: 587, dur: 0.4 },
      // 好
      { freq: 659, dur: 0.4 },
      // 的
      { freq: 784, dur: 0.4 },
      // 请
      { freq: 880, dur: 0.4 },
      // 过
      { freq: 784, dur: 0.8 },
      // 来～
      { freq: 659, dur: 0.4 },
      // 不
      { freq: 587, dur: 0.4 },
      // 好
      { freq: 659, dur: 0.4 },
      // 的
      { freq: 784, dur: 0.4 },
      // 请
      { freq: 659, dur: 0.4 },
      // 走
      { freq: 523, dur: 1.2 },
      // 开～
      // ===== 礼多人不怪 =====
      { freq: 587, dur: 0.4 },
      // 礼
      { freq: 659, dur: 0.4 },
      // 多
      { freq: 784, dur: 0.4 },
      // 人
      { freq: 659, dur: 0.4 },
      // 不
      { freq: 587, dur: 0.8 },
      // 怪～
      { freq: 523, dur: 1.5 },
      // （收）
      // ===== 间奏过渡 =====
      { freq: 0, dur: 0.8 },
      // ===== 恭喜发财 循环再现 =====
      { freq: 523, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.4 },
      { freq: 880, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.4 },
      { freq: 1047, dur: 0.4 },
      { freq: 880, dur: 0.6 },
      { freq: 784, dur: 1.2 },
      // ===== 收尾高音 =====
      { freq: 880, dur: 0.5 },
      { freq: 1047, dur: 0.5 },
      { freq: 880, dur: 0.5 },
      { freq: 784, dur: 0.5 },
      { freq: 659, dur: 2 },
      { freq: 0, dur: 1.5 }
      // 段落呼吸
    ],
    duration: 260,
    volume: 0.08,
    wave: "square",
    gate: 0.8,
    articulation: {
      attackTime: 3e-3,
      releaseTime: 0.02,
      sustainRatio: 0.6
    }
  };
  var gong_xi_fa_cai_default = GongXiFaCai;

  // lib/services/audio/constants/bgm/loginska.js
  var Loginska = {
    name: "Loginska",
    melody: [
      // === A段：沉稳推进 ===
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      // === B段：上行高潮 ===
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 880, dur: 0.6 },
      { freq: 988, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 0.4 },
      { freq: 880, dur: 0.4 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 587, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      // === C段：急促下行收束 ===
      { freq: 784, dur: 1.2 },
      { freq: 784, dur: 0.4 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 659, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 523, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 440, dur: 0.4 },
      { freq: 440, dur: 0.4 }
    ],
    duration: 180,
    volume: 0.07,
    wave: "square"
  };
  var loginska_default = Loginska;

  // lib/services/audio/constants/bgm/beyond-the-wall.js
  var BeyondTheWall = {
    name: "BeyondTheWall",
    // 推荐：全局控制（你也可以在 engine 里做分段 gate）
    config: {
      gate: {
        intro: 0.92,
        main: 0.93,
        drive: 0.96,
        dnb: 0.88,
        outro: 0.91
      }
    },
    melody: [
      // 前奏：胡笳感脉冲
      { freq: 330, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 392, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 330, dur: 0.6 },
      { freq: 392, dur: 0.6 },
      { freq: 330, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 392, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 440, dur: 1.8 },
      { freq: 0, dur: 0.3 },
      // 主旋律：苍凉开场
      { freq: 440, dur: 1.2 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 1.2 },
      { freq: 0, dur: 0.2 },
      { freq: 523, dur: 0.6 },
      { freq: 440, dur: 1.2 },
      { freq: 392, dur: 0.6 },
      { freq: 330, dur: 1.2 },
      { freq: 392, dur: 1.2 },
      { freq: 0, dur: 0.25 },
      { freq: 440, dur: 1.2 },
      { freq: 523, dur: 0.6 },
      { freq: 659, dur: 1.8 },
      { freq: 0, dur: 0.2 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 440, dur: 0.6 },
      { freq: 392, dur: 1.2 },
      { freq: 330, dur: 1.2 },
      { freq: 0, dur: 0.3 },
      // 推进段：马蹄
      { freq: 392, dur: 0.6 },
      { freq: 440, dur: 0.3 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 523, dur: 0.6 },
      { freq: 440, dur: 0.3 },
      { freq: 392, dur: 0.6 },
      { freq: 440, dur: 0.3 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 659, dur: 1.2 },
      { freq: 0, dur: 0.2 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      // 高潮：边塞号角（加“断气点”）
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 1.8 },
      { freq: 0, dur: 0.25 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 440, dur: 0.6 },
      { freq: 0, dur: 0.2 },
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 0, dur: 0.25 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.8 },
      // DnB段：改成“破碎节奏 + 空拍”
      { freq: 440, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 440, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 440, dur: 0.4 },
      { freq: 392, dur: 0.4 },
      { freq: 330, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 392, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 523, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      { freq: 587, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 523, dur: 0.4 },
      { freq: 440, dur: 0.4 },
      { freq: 392, dur: 0.4 },
      { freq: 0, dur: 0.2 },
      { freq: 440, dur: 0.4 },
      { freq: 523, dur: 0.4 },
      // 回落：大漠孤烟（拉长 + 留白）
      { freq: 659, dur: 1.2 },
      { freq: 0, dur: 0.25 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 1.2 },
      { freq: 440, dur: 0.6 },
      { freq: 392, dur: 1.2 },
      { freq: 330, dur: 1.2 },
      { freq: 0, dur: 0.3 },
      { freq: 392, dur: 1.2 },
      { freq: 330, dur: 0.6 },
      { freq: 294, dur: 1.2 },
      { freq: 0, dur: 0.25 },
      { freq: 330, dur: 0.6 },
      { freq: 392, dur: 1.8 },
      // 循环衔接（更“远”）
      { freq: 330, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 392, dur: 0.6 },
      { freq: 0, dur: 0.15 },
      { freq: 330, dur: 0.6 },
      { freq: 392, dur: 0.6 },
      { freq: 440, dur: 1.8 }
    ],
    duration: 130,
    volume: 0.09,
    wave: "triangle"
  };
  var beyond_the_wall_default = BeyondTheWall;

  // lib/services/audio/constants/bgm/technotris.js
  var Technotris = {
    name: "Technotris",
    melody: [
      // === Intro（电子重复）===
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      { freq: 494, dur: 0.6 },
      // === 主旋律A ===
      { freq: 659, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // === 电子重复变体 ===
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      // === 上行推进 ===
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 988, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      // === 高潮 ===
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 988, dur: 0.8 },
      { freq: 1175, dur: 1.2 },
      { freq: 988, dur: 0.8 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      // === Break ===
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      // === Drop ===
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 988, dur: 0.6 },
      { freq: 988, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 784, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      { freq: 523, dur: 0.6 },
      // === Ending ===
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 1.6 }
    ],
    duration: 180,
    volume: 0.09,
    wave: "square"
  };
  var technotris_default = Technotris;

  // lib/services/audio/constants/bgm/golden-snake-dance.js
  var GoldenSnakeDance = {
    name: "Golden Snake Dance",
    melody: [
      // ===== 核心主题：赛龙舟 =====
      { freq: 659, dur: 0.3 },
      // 啦 (E5)
      { freq: 587, dur: 0.3 },
      // 啦 (D5)
      { freq: 523, dur: 0.3 },
      // 啦 (C5)
      { freq: 587, dur: 0.3 },
      // 啦
      { freq: 659, dur: 0.6 },
      // 啦～
      { freq: 659, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 523, dur: 0.3 },
      { freq: 440, dur: 0.3 },
      // 啦 (A4)
      { freq: 523, dur: 0.3 },
      { freq: 587, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 587, dur: 0.3 },
      { freq: 587, dur: 0.6 },
      // ===== 对答段落：锣鼓模仿 =====
      { freq: 784, dur: 0.2 },
      // 锵 (G5)
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 659, dur: 0.4 },
      // 咚
      { freq: 659, dur: 0.2 },
      // 咚
      { freq: 659, dur: 0.2 },
      // 咚
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 880, dur: 0.2 },
      // 锵 (A5)
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 659, dur: 0.4 },
      // 咚
      { freq: 659, dur: 0.2 },
      // 咚
      { freq: 659, dur: 0.2 },
      // 咚
      { freq: 880, dur: 0.2 },
      // 锵
      { freq: 784, dur: 0.2 },
      // 锵
      { freq: 659, dur: 0.2 },
      // 锵
      { freq: 587, dur: 0.4 },
      // 咚
      { freq: 587, dur: 0.2 },
      // 咚
      { freq: 587, dur: 0.2 },
      // 咚
      { freq: 784, dur: 0.2 },
      { freq: 659, dur: 0.2 },
      { freq: 587, dur: 0.2 },
      { freq: 523, dur: 0.6 },
      // 咚～
      { freq: 523, dur: 0.3 },
      { freq: 523, dur: 0.3 },
      // ===== 主题再现，上行递进 =====
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      // 拔高
      { freq: 880, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 1047, dur: 0.6 },
      // 更高 (C6)
      { freq: 1047, dur: 0.3 },
      { freq: 1047, dur: 0.3 },
      { freq: 1047, dur: 0.6 },
      { freq: 880, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 880, dur: 0.6 },
      { freq: 880, dur: 0.3 },
      { freq: 880, dur: 0.3 },
      { freq: 880, dur: 0.6 },
      // ===== 热烈对答，加速感 =====
      { freq: 784, dur: 0.15 },
      { freq: 880, dur: 0.15 },
      { freq: 784, dur: 0.15 },
      { freq: 659, dur: 0.15 },
      { freq: 587, dur: 0.15 },
      { freq: 659, dur: 0.15 },
      { freq: 784, dur: 0.4 },
      { freq: 659, dur: 0.4 },
      { freq: 784, dur: 0.15 },
      { freq: 880, dur: 0.15 },
      { freq: 784, dur: 0.15 },
      { freq: 1047, dur: 0.15 },
      { freq: 880, dur: 0.15 },
      { freq: 784, dur: 0.15 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.4 },
      // ===== 收束 =====
      { freq: 659, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 880, dur: 0.3 },
      { freq: 784, dur: 0.3 },
      { freq: 659, dur: 0.6 },
      { freq: 587, dur: 0.3 },
      { freq: 523, dur: 1.5 },
      { freq: 0, dur: 1 }
    ],
    duration: 200,
    // 快节奏
    volume: 0.08,
    wave: "square",
    gate: 0.6,
    // 明显断奏，模仿弹拨乐颗粒感
    articulation: {
      attackTime: 2e-3,
      releaseTime: 0.015,
      sustainRatio: 0.4
      // 低延音，音符跳跃
    }
  };
  var golden_snake_dance_default = GoldenSnakeDance;

  // lib/services/audio/constants/bgm/korobeiniki.js
  var Korobeiniki = {
    name: "Korobeiniki",
    melody: [
      // === A段（经典开头）===
      { freq: 659, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // === A'段（变体）===
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // === B段（推进）===
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      // === C段（高潮）===
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 1.2 },
      // === D段（变化）===
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 1.2 },
      { freq: 784, dur: 1.2 },
      { freq: 880, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // === E段（回落）===
      { freq: 440, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 1.2 },
      { freq: 587, dur: 1.2 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 0.8 },
      { freq: 494, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 1.2 },
      // === F段（再现+收束）===
      { freq: 659, dur: 0.8 },
      { freq: 784, dur: 0.8 },
      { freq: 880, dur: 1.2 },
      { freq: 784, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 659, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 587, dur: 1.2 },
      { freq: 659, dur: 0.8 },
      { freq: 587, dur: 0.8 },
      { freq: 523, dur: 0.8 },
      { freq: 494, dur: 1.2 },
      // === 结尾（循环点）===
      { freq: 523, dur: 1.2 },
      { freq: 494, dur: 0.8 },
      { freq: 440, dur: 1.6 }
    ],
    duration: 140,
    volume: 0.08,
    wave: "square"
  };
  var korobeiniki_default = Korobeiniki;

  // lib/services/audio/constants/bgm/journey-to-west.js
  var JourneyToWest = {
    name: "JourneyToWest",
    melody: [
      // === 前奏：标志性的"丢丢丢丢" ===
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 0, dur: 0.6 },
      // 休止
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 0, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 1.2 },
      { freq: 0, dur: 0.6 },
      { freq: 880, dur: 1.2 },
      { freq: 880, dur: 2.4 },
      // === 主旋律（附点节奏 3-1-1） ===
      { freq: 440, dur: 3.6 },
      { freq: 440, dur: 0.9 },
      { freq: 440, dur: 2.7 },
      { freq: 523, dur: 3.6 },
      { freq: 587, dur: 3.6 },
      { freq: 587, dur: 0.9 },
      { freq: 587, dur: 2.7 },
      { freq: 659, dur: 4.5 },
      // === 冲上云霄 ===
      { freq: 880, dur: 3.6 },
      { freq: 880, dur: 0.9 },
      { freq: 880, dur: 2.7 },
      { freq: 784, dur: 3.6 },
      { freq: 659, dur: 3.6 },
      { freq: 659, dur: 0.9 },
      { freq: 659, dur: 2.7 },
      { freq: 659, dur: 4.5 },
      // === 转折 ===
      { freq: 587, dur: 3.6 },
      { freq: 587, dur: 0.9 },
      { freq: 587, dur: 2.7 },
      { freq: 523, dur: 3.6 },
      { freq: 440, dur: 3.6 },
      { freq: 440, dur: 0.9 },
      { freq: 440, dur: 2.7 },
      { freq: 440, dur: 4.5 },
      // === 燃段 ===
      { freq: 587, dur: 2.7 },
      { freq: 587, dur: 1.8 },
      { freq: 659, dur: 2.7 },
      { freq: 784, dur: 3.6 },
      { freq: 784, dur: 1.8 },
      { freq: 784, dur: 1.8 },
      { freq: 880, dur: 3.6 },
      { freq: 988, dur: 2.7 },
      { freq: 988, dur: 1.8 },
      { freq: 988, dur: 2.7 },
      { freq: 880, dur: 3.6 },
      { freq: 784, dur: 2.7 },
      { freq: 784, dur: 1.8 },
      { freq: 784, dur: 3.6 },
      // === 回响：超高音 ===
      { freq: 1175, dur: 1.4 },
      { freq: 1175, dur: 1.4 },
      { freq: 0, dur: 0.9 },
      { freq: 1175, dur: 1.4 },
      { freq: 1175, dur: 1.4 },
      { freq: 0, dur: 0.9 },
      { freq: 880, dur: 2.7 },
      { freq: 880, dur: 2.7 },
      // === 结尾 ===
      { freq: 440, dur: 3.6 },
      { freq: 440, dur: 1.8 },
      { freq: 440, dur: 3.6 },
      { freq: 440, dur: 1.8 },
      { freq: 440, dur: 5.4 }
    ],
    duration: 110,
    volume: 0.12,
    wave: "square"
  };
  var journey_to_west_default = JourneyToWest;

  // lib/services/audio/constants/musics.js
  var Musics = {
    /**
     * ## 背景音乐：TetrisTheme
     *
     * @type {Music}
     */
    TetrisTheme: tetris_theme_default,
    /**
     * ## 背景音乐：SpringFestival
     *
     * @type {Music}
     */
    SpringFestival: spring_festival_default,
    /**
     * ## 背景音乐：FirstDivision
     *
     * @type {Music}
     */
    FirstDivision: first_division_default,
    /**
     * ## 背景音乐：GongXiFaCai
     *
     * @type {Music}
     */
    GongXiFaCai: gong_xi_fa_cai_default,
    /**
     * ## 背景音乐：Loginska
     *
     * @type {Music}
     */
    Loginska: loginska_default,
    /**
     * ## 背景音乐：BeyondTheWall
     *
     * @type {Music}
     */
    BeyondTheWall: beyond_the_wall_default,
    /**
     * ## 背景音乐：Technotris
     *
     * @type {Music}
     */
    Technotris: technotris_default,
    /**
     * ## 背景音乐：GoldenSnakeDance
     *
     * @type {Music}
     */
    GoldenSnakeDance: golden_snake_dance_default,
    /**
     * ## 背景音乐：Korobeiniki
     *
     * @type {Music}
     */
    Korobeiniki: korobeiniki_default,
    /**
     * ## 背景音乐：JourneyToWest
     *
     * @type {Music}
     */
    JourneyToWest: journey_to_west_default
  };
  var musics_default = Musics;

  // lib/services/audio/loop-resume-bgm.js
  var SCHEDULE_AHEAD_TIME = 0.12;
  var LOOKAHEAD = 25;
  var loopPlayBGM = (audio, melody, options = {}) => {
    const {
      duration = 110,
      volume = 0.05,
      wave = "square",
      gate = 1,
      articulation = {}
    } = options;
    const { Scheduler: Scheduler2, Context } = audio;
    if (duration <= 0 || !melody?.length) {
      return;
    }
    let currentNoteIndex = 0;
    let nextNoteTime = Context.currentTime;
    const scheduleNote = (note, time) => {
      const stepDur = note.dur * duration;
      if (note.freq > 0) {
        play_tone_default(audio, note.freq, stepDur, {
          volume,
          wave,
          gate,
          articulation,
          startTime: time
        });
      }
    };
    const scheduler = () => {
      const audioNow = Context.currentTime;
      const limit = audioNow + SCHEDULE_AHEAD_TIME;
      while (nextNoteTime < limit) {
        const note = melody[currentNoteIndex];
        scheduleNote(note, nextNoteTime);
        const stepDur = note.dur * duration;
        nextNoteTime += stepDur / 1e3;
        currentNoteIndex = (currentNoteIndex + 1) % melody.length;
      }
    };
    audio.bgmSchedulerId = Scheduler2.interval(scheduler, LOOKAHEAD);
  };
  var loop_play_bgm_default = loopPlayBGM;

  // lib/services/audio/resume-bgm.js
  var {
    TetrisTheme: TetrisTheme2,
    SpringFestival: SpringFestival2,
    FirstDivision: FirstDivision2,
    GongXiFaCai: GongXiFaCai2,
    Loginska: Loginska2,
    BeyondTheWall: BeyondTheWall2,
    Technotris: Technotris2,
    GoldenSnakeDance: GoldenSnakeDance2,
    Korobeiniki: Korobeiniki2,
    JourneyToWest: JourneyToWest2
  } = musics_default;
  var MUSIC_LIST = [
    TetrisTheme2,
    SpringFestival2,
    FirstDivision2,
    GongXiFaCai2,
    Loginska2,
    BeyondTheWall2,
    Technotris2,
    GoldenSnakeDance2,
    Korobeiniki2,
    JourneyToWest2
  ];
  var getMusicByLevel = (audio, level) => {
    const { length } = MUSIC_LIST;
    const maxLevel = audio.Level.max;
    const step = Math.floor(maxLevel / length);
    const index = Math.min(Math.floor((level - 1) / step), length - 1);
    return MUSIC_LIST[index];
  };
  var playBGM = (audio, level = 1) => {
    const music = getMusicByLevel(audio, level);
    const { melody, duration, volume, wave, gate, articulation } = music;
    loop_play_bgm_default(audio, melody, {
      duration,
      volume,
      wave,
      gate,
      articulation
    });
  };
  var play_bgm_default = playBGM;

  // lib/services/audio/stop-bgm.js
  var stopBGM = (audio) => {
    audio.Scheduler.cancel(audio.bgmSchedulerId);
    audio.bgmSchedulerId = 0;
  };
  var stop_bgm_default = stopBGM;

  // lib/services/audio/toggle-bgm.js
  var toggleBGM = (audio, level) => {
    if (audio.bgmSchedulerId === 0) {
      play_bgm_default(audio, level);
    } else {
      stop_bgm_default(audio);
    }
  };
  var toggle_bgm_default = toggleBGM;

  // lib/services/audio/index.js
  var Audio = class extends core_default {
    constructor(options) {
      super(options);
      this.initialize(options);
    }
    initialize(options) {
      const Context = new AudioContext();
      this.Context = Context;
      this.Sounds = new sounds_default({
        ...options,
        Context
      });
      this.bgmSchedulerId = 0;
    }
    playBGM(level) {
      play_bgm_default(this, level);
    }
    stopBGM() {
      stop_bgm_default(this);
    }
    toggleBGM(level) {
      toggle_bgm_default(this, level);
    }
    subscribe() {
      this.on("audio:resume:bgm", this._onPlayBGM);
      this.on("audio:stop:bgm", this._onStopBGM);
      this.on("audio:toggle:bgm", this._onToggleBGM);
      this.on("audio:resume:sound", this._onPlaySound);
    }
    unsubscribe() {
      this.off("audio:resume:bgm", this._onPlayBGM);
      this.off("audio:stop:bgm", this._onStopBGM);
      this.off("audio:toggle:bgm", this._onToggleBGM);
      this.off("audio:resume:sound", this._onPlaySound);
    }
    _onPlayBGM = ({ level }) => {
      this.playBGM(level);
    };
    _onStopBGM = () => {
      this.stopBGM();
    };
    _onToggleBGM = ({ level }) => {
      this.emit("audio:resume:sound", { sound: "BGM_TOGGLED" });
      this.toggleBGM(level);
    };
    _onPlaySound = ({ sound, lines }) => {
      const handler = this.Sounds[sound];
      if (is_function_default(handler)) {
        handler(lines);
      }
    };
  };
  var audio_default = Audio;

  // lib/state/game-state.js
  var GameState = {
    beginningBoard: [],
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
    difficulty: "easy",
    /*
     * main-menu：等级选择（主菜单）
     * playing：游戏中
     * paused：游戏暂停
     * game-over：游戏结束
     */
    mode: "main-menu",
    gamepadConnected: false
  };
  var game_state_default = GameState;

  // lib/state/utils/generate-garbage-rows.js
  var { RED: RED2, GREEN: GREEN2, BLUE: BLUE2, YELLOW: YELLOW2, PURPLE: PURPLE2, TEAL: TEAL2, ORANGE: ORANGE2 } = colors_default;
  var DEFAULT_COLOR_MAP = [RED2, GREEN2, BLUE2, YELLOW2, PURPLE2, TEAL2, ORANGE2];
  var generateGarbageRows = (rows, cols, colorMap) => {
    const colors = colorMap || DEFAULT_COLOR_MAP;
    const garbage = [];
    for (let i = 0; i < rows; i += 1) {
      const row = Array.from({ length: cols }).fill("");
      for (let col = 0; col < cols; col += 1) {
        row[col] = colors[Math.floor(Math.random() * colors.length)];
      }
      const maxHoles = cols - 3;
      const holes = 1 + Math.floor(Math.random() * maxHoles);
      const holePositions = /* @__PURE__ */ new Set();
      while (holePositions.size < holes) {
        holePositions.add(Math.floor(Math.random() * cols));
      }
      for (const pos of holePositions) {
        row[pos] = "";
      }
      garbage.push(row);
    }
    return garbage;
  };
  var generate_garbage_rows_default = generateGarbageRows;

  // lib/state/utils/place-garbage-on-board.js
  var placeGarbageOnBoard = (board, garbageRowCount, cols) => {
    const rows = board.length;
    if (garbageRowCount <= 0) return;
    const garbageRows = generate_garbage_rows_default(garbageRowCount, cols);
    const startRow = rows - garbageRowCount;
    for (let i = 0; i < garbageRows.length; i++) {
      if (startRow + i >= 0) {
        board[startRow + i] = [...garbageRows[i]];
      }
    }
  };
  var place_garbage_on_board_default = placeGarbageOnBoard;

  // lib/state/game-store.js
  var GameStore = class {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} [options=GameState] - 可选初始状态（用于重置或测试）. Default is
     *   `GameState`
     */
    constructor(options) {
      this.initialize(options);
    }
    initialize(options) {
      const { GameState: GameState2, cols, rows } = options;
      this.defaults = structuredClone(GameState2);
      this.options = { cols, rows };
      this.state = structuredClone(GameState2);
    }
    /**
     * ## 获取完整 state
     *
     * @returns {object} 当前游戏状态
     */
    getState() {
      return this.state;
    }
    /**
     * ## 更新 state（支持 patch 或函数）
     *
     * 支持两种模式：
     *
     * 1. Object patch
     * 2. Function (prevState) => patch
     *
     * @param {object | Function} patch - 状态更新内容或函数
     */
    setState(patch) {
      this.state = {
        ...this.state,
        ...is_function_default(patch) ? patch(this.state) : patch
      };
    }
    /** 重置状态为默认 GameState */
    resetState() {
      this.state = structuredClone(this.defaults);
    }
    /**
     * ## 重置棋盘
     *
     * 根据 BOARD 常量重新生成空棋盘
     */
    resetBoard() {
      const { cols, rows } = this.options;
      this.state.board = Array.from(
        { length: rows },
        () => Array.from({ length: cols }).fill(0)
      );
    }
    /**
     * ## 生成游戏初始化的 board 数据
     *
     * 根据传入的 difficulty 参数，生成不同行数的方块数据
     *
     * @returns {Array} 返回生成的 board 数据
     */
    generateBoard() {
      const DIFFICULTY_GARBAGE_ROWS = {
        easy: 0,
        normal: 3,
        hard: 6,
        expert: 9
      };
      const { board, difficulty } = this.state;
      const cols = board[0].length;
      const garbageRows = DIFFICULTY_GARBAGE_ROWS[difficulty] || 0;
      place_garbage_on_board_default(board, garbageRows, cols);
      return board;
    }
    /**
     * 设置初始棋盘（深拷贝）
     *
     * @param {Array} board - 游戏画板数据
     */
    setBeginningBoard(board) {
      this.state.beginningBoard = structuredClone(board);
    }
    /**
     * 获取初始棋盘（深拷贝副本）
     *
     * @returns {Array} - 返回初始设置难度生成的方块的画布数据
     */
    getBeginningBoard() {
      return structuredClone(this.state.beginningBoard);
    }
    /**
     * 设置游戏手柄连接状态
     *
     * @param {boolean} connected - 游戏手柄是否连接
     */
    setGamepadConnected(connected) {
      this.state.gamepadConnected = connected;
    }
    /**
     * 获取游戏手柄是否已连接
     *
     * @returns {boolean} - 游戏手柄连接，返回 true，否则返回 false
     */
    isGamepadConnected() {
      return this.state.gamepadConnected;
    }
    /**
     * ## 获取游戏难度等级
     *
     * @returns {string} - 获取游戏的难度等级
     */
    getDifficulty() {
      return this.state.difficulty;
    }
    /**
     * ## 设置游戏难度等级
     *
     * @param {string} [difficulty='easy'] - 难度等级名称，可选值：easy, normal, hard,
     *   expert. Default is `'easy'`
     */
    setDifficulty(difficulty = "easy") {
      this.state.difficulty = difficulty;
    }
    /**
     * ## 获取已消除行数（baseLines）
     *
     * @returns {number} - 返回初始消除行数信息
     */
    getBaseLines() {
      return this.state.baseLines;
    }
    /**
     * ## 设置基础行数
     *
     * @param {number} lines - 初始消除行数
     */
    setBaseLines(lines) {
      this.state.baseLines = lines;
    }
    /**
     * ## 获取当前已消除行数据
     *
     * @returns {object[]} - 返回清理的行数数据
     */
    getClearLines() {
      return this.state.clearLines;
    }
    /**
     * ## 设置当前消除行
     *
     * @param {number[]} lines - 消除行数组
     */
    setClearLines(lines) {
      this.state.clearLines = lines;
    }
    /**
     * ## 获取 HUD 数据
     *
     * 返回 UI 渲染所需的核心数据
     *
     * @returns {object} HUD 数据
     */
    getHub() {
      const { source, lines, level } = this.state;
      return { source, lines, level };
    }
    /**
     * ## 设置 HUD 数据
     *
     * @param {object} hud - HUD 数据对象
     * @param {number} hud.score - 当前得分
     * @param {number} hud.lines - 当前消除行数
     * @param {number} hud.level - 当前等级
     */
    setHud(hud) {
      const { score, lines, level } = hud;
      this.state.score = score;
      this.state.lines = lines;
      this.state.level = level;
    }
    /**
     * 获取当前分数
     *
     * @returns {number} - 返回当前得分
     */
    getScore() {
      return this.state.score;
    }
    /**
     * ## 设置最高分
     *
     * @param {number} highScore - 历史最高分
     */
    setHighScore(highScore) {
      this.state.highScore = highScore;
    }
    /**
     * ## 获取最高分
     *
     * @returns {number} - 返回最高得分
     */
    getHighScore() {
      return this.state.highScore;
    }
    /**
     * ## 获取当前等级
     *
     * @returns {number} - 获取游戏等级
     */
    getLevel() {
      return this.state.level;
    }
    /**
     * ## 设置当前等级
     *
     * @param {number} level - 游戏等级值
     */
    setLevel(level) {
      this.state.level = level;
    }
    /**
     * ## 获取游戏模式
     *
     * @returns {string} 当前模式（main-menu / playing / paused / game-over）
     */
    getMode() {
      return this.state.mode;
    }
    /**
     * ## 设置游戏模式
     *
     * @param {string} mode - 游戏模式
     */
    setMode(mode) {
      this.state.mode = mode;
    }
  };
  var game_store_default = GameStore;

  // lib/core/command/command-queue.js
  var CommandQueue = class extends core_default {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.queue = [];
    }
    /**
     * ## 入队一个 Command
     *
     * @param {object} command - 要执行的命令
     */
    enqueue(command) {
      this.queue.push(command);
    }
    /**
     * ## 执行并清空队列中的所有 Command
     *
     * 当前行为：
     *
     * - 一次性执行全部 command
     * - 不做时间分帧控制
     */
    flush() {
      const { queue } = this;
      while (queue.length > 0) {
        const cmd = queue.shift();
        cmd.execute();
      }
    }
    /** ## 清空队列（丢弃所有未执行命令） */
    clear() {
      this.queue.length = 0;
    }
    subscribe() {
      const uuid = this.Game.id;
      this.on(`command:queue:${uuid}:clear`, this._onClear);
      this.on(`command:queue:${uuid}:enqueue`, this._onEnqueue);
    }
    unsubscribe() {
      const uuid = this.Game.id;
      this.off(`command:queue:${uuid}:clear`, this._onClear);
      this.off(`command:queue:${uuid}:enqueue`, this._onEnqueue);
    }
    _onClear = () => {
      this.clear();
    };
    _onEnqueue = ({ cmd }) => {
      this.enqueue(cmd);
    };
  };
  var command_queue_default = CommandQueue;

  // lib/runtime/animation-system.js
  var AnimationSystem = class extends core_default {
    /** 当前活跃的动画队列 @type {Animation[]} */
    #queue = [];
    /** 等待注册的动画队列（延迟到下一帧生效） @type {Animation[]} */
    #pending = [];
    /** 按 layer 排序后的缓存数组 @type {Animation[]} */
    #sorted = [];
    /** 排序缓存是否需要重新计算 @type {boolean} */
    #dirty = false;
    /**
     * 当前活跃动画 + 待处理动画的总数（调试用）。
     *
     * @returns {number} - 返回当前活跃动画 + 待处理动画的总数
     */
    get size() {
      return this.#queue.length + this.#pending.length;
    }
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
    }
    /**
     * ## 注册动画
     *
     * 将动画对象注册到系统中。新动画在下次 update() 时合并到活跃队列， 避免在遍历过程中修改数组。
     *
     * @param {Animation} animation - 动画对象，必须包含 update() 和 render() 方法
     * @throws {Error} 如果动画对象无效则抛出错误
     */
    register(animation) {
      if (!animation || typeof animation.update !== "function" || typeof animation.render !== "function") {
        throw new Error(
          "Invalid animation: must implement update() and render()"
        );
      }
      animation.layer ??= 0;
      animation.blocking ??= false;
      animation.name ??= "anonymous";
      this.#pending.push(animation);
      this.#dirty = true;
    }
    /**
     * ## 更新所有动画
     *
     * 在游戏逻辑循环中调用。执行流程：
     *
     * 1. 合并待注册动画到活跃队列
     * 2. 遍历所有动画并调用 update()
     * 3. 自动移除返回 false 的已结束动画
     * 4. 处理 update() 过程中新注册的动画（补丁合并）
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     */
    update(delta) {
      this.#mergePending();
      let processedCount = 0;
      while (processedCount < this.#queue.length) {
        const anim = this.#queue[processedCount];
        const alive = anim.update(delta);
        if (alive) {
          processedCount++;
        } else {
          this.#queue.splice(processedCount, 1);
          this.#dirty = true;
        }
        if (this.#pending.length > 0) {
          this.#mergePending();
        }
      }
    }
    /**
     * ## 渲染所有动画
     *
     * 在渲染循环中调用。采用懒排序策略，只在队列变化时重新排序。 渲染顺序：layer 越小越先渲染（底层），越大越后渲染（顶层）。
     */
    render() {
      if (this.#dirty) {
        this.#sorted = this.#queue.slice().toSorted((a, b) => a.layer - b.layer);
        this.#dirty = false;
      }
      for (const animation of this.#sorted) {
        animation.render();
      }
    }
    /**
     * ## 检查是否存在阻塞性动画
     *
     * 用于判断是否需要阻塞用户输入或游戏逻辑。
     *
     * @param {string[]} [names=[]] - 可选，指定要检查的动画名称列表。 为空时检查所有阻塞动画。. Default is
     *   `[]`
     * @returns {boolean} 存在匹配的阻塞动画则返回 true
     */
    hasBlocking(names = []) {
      const hasNames = names.length > 0;
      for (const animation of this.#queue) {
        if (!animation.blocking) {
          continue;
        }
        if (!hasNames || names.includes(animation.name)) {
          return true;
        }
      }
      return false;
    }
    /**
     * ## 清空所有动画
     *
     * 移除系统中的所有动画，重置内部状态。 通常在游戏重置、场景切换或紧急清理时使用。
     */
    clear() {
      this.#queue.length = 0;
      this.#pending.length = 0;
      this.#sorted.length = 0;
      this.#dirty = false;
    }
    /**
     * 将待注册动画合并到活跃队列。
     *
     * @private
     */
    #mergePending() {
      if (this.#pending.length === 0) return;
      this.#queue.push(...this.#pending);
      this.#pending.length = 0;
      this.#dirty = true;
    }
    subscribe() {
      this.on(`animations:${this.Game.id}:clear`, this._onClear);
    }
    unsubscribe() {
      this.off(`animations:${this.Game.id}:clear`, this._onClear);
    }
    _onClear = () => {
      this.clear();
    };
  };
  var animation_system_default = AnimationSystem;

  // lib/services/ui/core/canvas.js
  var Canvas = class {
    constructor(options) {
      const { board, next, cols, rows } = options;
      this.rows = rows;
      this.cols = cols;
      this.gameBoard = document.querySelector(`#${board}`);
      this.gameBoardContext = this.gameBoard.getContext("2d");
      this.nextPiece = document.querySelector(`#${next}`);
      this.nextPieceContext = this.nextPiece.getContext("2d");
      this.fontSize = 0;
      this.blockSize = 0;
    }
  };
  var canvas_default = Canvas;

  // lib/services/ui/hud/hud-elements.js
  var HudElements = (options) => {
    const { score, lines, level, highScore } = options;
    return {
      /** @type {HTMLElement | null} 分数显示元素 */
      score: document.querySelector(`#${score}`),
      /** @type {HTMLElement | null} 行数显示元素 */
      lines: document.querySelector(`#${lines}`),
      /** @type {HTMLElement | null} 等级显示元素 */
      level: document.querySelector(`#${level}`),
      /** @type {HTMLElement | null} 最高分显示元素 */
      highScore: document.querySelector(`#${highScore}`)
    };
  };
  var hud_elements_default = HudElements;

  // lib/services/ui/board/clear-board.js
  function clearBoard(canvas) {
    const { gameBoard, gameBoardContext } = canvas;
    const { width, height } = gameBoard;
    gameBoardContext.clearRect(0, 0, width, height);
  }
  var clear_board_default = clearBoard;

  // lib/game/constants/game.js
  var CLEAR_LINE_SCORES = [0, 100, 300, 500, 800, 1200];
  var FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;
  var GAME = {
    CLEAR_LINE_SCORES,
    FONT_FAMILY
  };
  var game_default = GAME;

  // lib/services/ui/text/render-text.js
  var renderText = (canvas, options) => {
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
    const { gameBoardContext: ctx, fontSize } = canvas;
    ctx.save();
    if (center) {
      ctx.textAlign = "center";
    }
    if (baseline) {
      ctx.textBaseline = baseline;
    }
    ctx.font = `${fontSize * size}px ${FONT_FAMILY2}`;
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

  // lib/services/ui/text/render-tetris-text.js
  var renderTetrisText = (canvas) => {
    const { GREEN: GREEN7 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "TETRIS.JS",
      x: width / 2,
      y: height * 0.1,
      color: GREEN7,
      size: 1.1
    });
  };
  var render_tetris_text_default = renderTetrisText;

  // lib/services/ui/text/render-level-text.js
  var renderLevelText = (canvas) => {
    const { GREEN: GREEN7 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "LEVEL",
      x: width / 2,
      y: height * 0.35,
      color: GREEN7,
      size: 1,
      center: true
    });
  };
  var render_level_text_default = renderLevelText;

  // lib/services/ui/text/render-level-number.js
  var renderLevelNumber = (canvas, level, y) => {
    const { GREEN: GREEN7 } = colors_default;
    const { gameBoard } = canvas;
    const { width } = gameBoard;
    render_text_default(canvas, {
      text: String(level),
      x: width / 2,
      y,
      color: GREEN7,
      size: 3,
      center: true
    });
  };
  var render_level_number_default = renderLevelNumber;

  // lib/services/ui/text/render-level-shortcut.js
  var renderLevelShortcut = (canvas) => {
    const { WHITE: WHITE3 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "1-9 or T KEY",
      x: width / 2,
      y: height * 0.58,
      color: WHITE3,
      size: 1,
      center: true
    });
  };
  var render_level_shortcut_default = renderLevelShortcut;

  // lib/services/ui/text/render-enter-continue-text.js
  var renderEnterContinueText = (canvas) => {
    const { TEAL: TEAL6, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "ENTER CONTINUE",
      x: width / 2,
      y: height * 0.74,
      color: TEAL6,
      strokeColor: BLACK2,
      size: 1,
      center: true,
      stroke: true
    });
  };
  var render_enter_continue_text_default = renderEnterContinueText;

  // lib/services/ui/overlay/render-overlay.js
  var renderOverlay = (canvas, color) => {
    const { RGBA_BLACK: RGBA_BLACK2 } = colors_default;
    const { gameBoard, gameBoardContext: ctx } = canvas;
    const { width, height } = gameBoard;
    ctx.save();
    ctx.fillStyle = color || RGBA_BLACK2;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };
  var render_overlay_default = renderOverlay;

  // lib/services/ui/image/image-manager.js
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
    ImagesCache.clear();
  };
  var preloadImages = (images) => {
    const svgs = Object.values(images);
    clearImagesCache();
    for (const svg of svgs) {
      getImage(svg);
    }
  };

  // lib/services/ui/image/render-image.js
  var renderImage = (canvas, options) => {
    const { gameBoardContext: ctx } = canvas;
    const { img, x, y, size } = options;
    if (!img.complete) {
      return;
    }
    ctx.save();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  };
  var render_image_default = renderImage;

  // lib/services/ui/image/render-scene-background.js
  var renderSceneBackground = (canvas, scene) => {
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    const hours = (/* @__PURE__ */ new Date()).getHours();
    let icon;
    let img;
    let size;
    let x;
    let y;
    switch (scene) {
      /** 主菜单 / 倒计时场景 */
      case "main-menu":
      case "countdown": {
        img = getImage(scenes_background_default.tetris);
        size = width;
        x = width / 2 - size / 2;
        y = height - size;
        break;
      }
      /** 游戏进行中场景（根据时间切换主题背景） */
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
      /** 暂停场景 */
      case "paused": {
        img = getImage(scenes_background_default.coffee);
        size = width * 0.76;
        x = width / 2 - size / 2;
        y = height - size * 0.94;
        break;
      }
      /** 游戏结束场景 */
      case "game-over": {
        img = getImage(scenes_background_default.happy);
        size = Math.floor(width * 0.42);
        x = width / 2 - size / 2;
        y = height / 2 - size * 1.35;
        break;
      }
    }
    render_image_default(canvas, { img, x, y, size });
  };
  var render_scene_background_default = renderSceneBackground;

  // lib/services/ui/scenes/main-menu-scene/render-main-menu.js
  var renderMainMenu = (canvas, level) => {
    const { gameBoard } = canvas;
    const { height } = gameBoard;
    clear_board_default(canvas);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "main-menu");
    render_tetris_text_default(canvas);
    render_level_text_default(canvas);
    render_level_number_default(canvas, level, height * 0.5);
    render_level_shortcut_default(canvas);
    render_enter_continue_text_default(canvas);
  };
  var render_main_menu_default = renderMainMenu;

  // lib/services/ui/scenes/main-menu-scene/index.js
  var mainMenuScene = (canvas, state) => {
    render_main_menu_default(canvas, state.level);
  };
  var main_menu_scene_default = mainMenuScene;

  // lib/services/ui/text/render-difficulty-text.js
  var renderDifficultText = (canvas) => {
    const { GREEN: GREEN7 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "DIFFICULTY",
      x: width / 2,
      y: height * 0.35,
      color: GREEN7,
      size: 1,
      center: true
    });
  };
  var render_difficulty_text_default = renderDifficultText;

  // lib/services/ui/text/render-difficult-words.js
  var renderDifficultyWords = (canvas, difficulty, y) => {
    const { GREEN: GREEN7 } = colors_default;
    const { gameBoard } = canvas;
    const { width } = gameBoard;
    render_text_default(canvas, {
      text: difficulty.toUpperCase(),
      x: width / 2,
      y,
      color: GREEN7,
      size: 2.2,
      center: true
    });
  };
  var render_difficult_words_default = renderDifficultyWords;

  // lib/services/ui/text/render-difficulty-shortcut.js
  var renderDifficultyShortcut = (canvas, state) => {
    const { WHITE: WHITE3 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    let text = "E/N/H/X KEY";
    if (state.gamepadConnected) {
      text = "A/B/Y/X KEY";
    }
    render_text_default(canvas, {
      text,
      x: width / 2,
      y: height * 0.58,
      color: WHITE3,
      size: 1,
      center: true
    });
  };
  var render_difficulty_shortcut_default = renderDifficultyShortcut;

  // lib/services/ui/text/render-enter-start-text.js
  var renderEnterStartText = (canvas) => {
    const { TEAL: TEAL6, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "ENTER START",
      x: width / 2,
      y: height * 0.74,
      color: TEAL6,
      strokeColor: BLACK2,
      size: 1.15,
      center: true,
      stroke: true
    });
  };
  var render_enter_start_text_default = renderEnterStartText;

  // lib/services/ui/scenes/difficulty-scene/render-difficulty-scene.js
  var renderDifficultyScene = (canvas, state) => {
    const { gameBoard } = canvas;
    const { height } = gameBoard;
    clear_board_default(canvas);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "main-menu");
    render_tetris_text_default(canvas);
    render_difficulty_text_default(canvas);
    render_difficult_words_default(canvas, state.difficulty, height * 0.5);
    render_difficulty_shortcut_default(canvas, state);
    render_enter_start_text_default(canvas);
  };
  var render_difficulty_scene_default = renderDifficultyScene;

  // lib/services/ui/scenes/difficulty-scene/index.js
  var difficultyScene = (canvas, state) => {
    render_difficulty_scene_default(canvas, state);
  };
  var difficulty_scene_default = difficultyScene;

  // lib/services/ui/text/render-paused-text.js
  var renderPausedText = (canvas) => {
    const { YELLOW: YELLOW6, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "PAUSED",
      x: width / 2,
      y: height / 1.4,
      color: YELLOW6,
      strokeColor: BLACK2,
      size: 1.6,
      center: true,
      stroke: true
    });
  };
  var render_paused_text_default = renderPausedText;

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

  // lib/services/ui/effects/render-digital-clock.js
  var { GREEN: GREEN3 } = colors_default;
  var renderDigitalClock = (canvas, time, color = GREEN3, format = "HH:mm:ss") => {
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    const text = format_time_default(time || /* @__PURE__ */ new Date(), format);
    render_text_default(canvas, {
      text,
      x: width / 2,
      y: height / 4.15,
      color,
      size: 0.94,
      center: true
    });
  };
  var render_digital_clock_default = renderDigitalClock;

  // lib/services/ui/effects/clock/constants/clock-themes.js
  var {
    CORAL: CORAL2,
    RGBA_CORAL: RGBA_CORAL2,
    WHITE: WHITE2,
    RGBA_WHITE: RGBA_WHITE3,
    PURPLE: PURPLE3,
    RGBA_PURPLE: RGBA_PURPLE2,
    TEAL: TEAL3,
    RGBA_TEAL: RGBA_TEAL2,
    PINK: PINK2,
    RGBA_PINK: RGBA_PINK2,
    ORANGE: ORANGE3,
    RGBA_ORANGE: RGBA_ORANGE2,
    GREEN: GREEN4,
    RGBA_GREEN: RGBA_GREEN2,
    BLUE: BLUE3,
    RGBA_BLUE: RGBA_BLUE2,
    YELLOW: YELLOW3,
    RGBA_YELLOW: RGBA_YELLOW2,
    RED: RED3,
    RGBA_RED: RGBA_RED2,
    VIOLET: VIOLET2,
    RGBA_VIOLET: RGBA_VIOLET2,
    CYAN: CYAN2,
    RGBA_CYAN: RGBA_CYAN2
  } = colors_default;
  var ClockThemes = {
    Teal: {
      stroke: TEAL3,
      face: RGBA_TEAL2,
      secondHand: VIOLET2
    },
    Violet: {
      stroke: VIOLET2,
      face: RGBA_VIOLET2,
      secondHand: TEAL3
    },
    Yellow: {
      stroke: YELLOW3,
      face: RGBA_YELLOW2,
      secondHand: PINK2
    },
    Pink: {
      stroke: PINK2,
      face: RGBA_PINK2,
      secondHand: YELLOW3
    },
    Purple: {
      stroke: PURPLE3,
      face: RGBA_PURPLE2,
      secondHand: GREEN4
    },
    Green: {
      stroke: GREEN4,
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
      stroke: ORANGE3,
      face: RGBA_ORANGE2,
      secondHand: CYAN2
    },
    Cyan: {
      stroke: CYAN2,
      face: RGBA_CYAN2,
      secondHand: ORANGE3
    },
    White: {
      stroke: WHITE2,
      face: RGBA_WHITE3,
      secondHand: RED3
    },
    Red: {
      stroke: RED3,
      face: RGBA_RED2,
      secondHand: WHITE2
    }
  };
  var clock_themes_default = ClockThemes;

  // lib/services/ui/effects/clock/utils/get-clock-angles.js
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

  // lib/services/ui/constants/images/chinese-hour-animals.js
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

  // lib/services/ui/image/utils/get-chinese-hour-animal.js
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

  // lib/services/ui/image/render-chinese-hour-animal.js
  var renderChineseHourAnimal = (canvas) => {
    const { gameBoard } = canvas;
    const { width } = gameBoard;
    const time = /* @__PURE__ */ new Date();
    const hour = time.getHours();
    const index = hour - 1;
    const animal = get_chinese_hour_animal_default(Math.max(index, 0));
    const img = getImage(chinese_hour_animals_default[animal]);
    const size = Math.floor(width * 0.38);
    const x = -size / 2;
    const y = -size / 2;
    render_image_default(canvas, { img, x, y, size });
  };
  var render_chinese_hour_animal_default = renderChineseHourAnimal;

  // lib/services/ui/effects/clock/render-clock-dial.js
  var renderClockDial = (canvas, radius, theme) => {
    const { gameBoardContext: ctx } = canvas;
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

  // lib/services/ui/effects/clock/render-clock-ticks.js
  var renderClockTicks = (canvas, radius, theme) => {
    const { gameBoardContext: ctx } = canvas;
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

  // lib/services/ui/effects/clock/render-clock-hands.js
  var renderClockHands = (canvas, radius, angles, theme) => {
    const { gameBoardContext: ctx } = canvas;
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

  // lib/services/ui/effects/clock/render-clock-center.js
  var renderClockCenter = (canvas, radius, theme) => {
    const { gameBoardContext: ctx } = canvas;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = theme.secondHand;
    ctx.arc(0, 0, Math.floor(radius * 0.05), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  var render_clock_center_default = renderClockCenter;

  // lib/services/ui/effects/clock/utils/get-chinese-hour-dial-theme.js
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

  // lib/services/ui/effects/clock/render-analog-clock.js
  var renderAnalogClock = (canvas, time) => {
    const { gameBoard, gameBoardContext: ctx } = canvas;
    const { width, height } = gameBoard;
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
    render_clock_dial_default(canvas, radius, theme);
    render_chinese_hour_animal_default(canvas);
    render_clock_ticks_default(canvas, radius, theme);
    render_clock_hands_default(canvas, radius, angles, theme);
    render_clock_center_default(canvas, radius, theme);
    ctx.restore();
  };
  var render_analog_clock_default = renderAnalogClock;

  // lib/services/ui/core/render-block.js
  var renderBlock = (canvas, x, y, color) => {
    const { gameBoardContext: ctx, blockSize } = canvas;
    const { RGBA_BLACK: RGBA_BLACK2 } = colors_default;
    const gap = 1;
    const size = blockSize - gap * 2;
    const px = x * blockSize + gap;
    const py = y * blockSize + gap;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, size, size);
    ctx.strokeStyle = RGBA_BLACK2;
    ctx.strokeRect(px, py, size, size);
  };
  var render_block_default = renderBlock;

  // lib/services/ui/constants/images/chinese-hour-characters.js
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

  // lib/services/ui/image/utils/get-chinese-hour-character.js
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

  // lib/services/ui/image/render-chinese-hour-character.js
  var LAYOUT_STRATEGIES = {
    // 深夜 0-3 点
    night_0_3: (width, height) => ({
      size: Math.floor(width * 0.48),
      x: width - Math.floor(width * 0.48) * 0.7,
      y: height / 2 - Math.floor(width * 0.48) * 1.4
    }),
    // 清晨 4-7 点
    morning_4_7: (width, height) => {
      const size = Math.floor(width * 0.52);
      return {
        size,
        x: width - size * 1.1,
        y: height / 2 - size * 1.7
      };
    },
    // 上午 8-11 点
    morning_8_11: (width, height) => {
      const size = Math.floor(width * 0.58);
      return {
        size,
        x: width - size * 1.2,
        y: height / 2 - size * 1.75
      };
    },
    // 中午 12-14 点
    noon_12_14: (width) => {
      const size = Math.floor(width * 0.68);
      return {
        size,
        x: width / 2 - size / 2,
        y: -size * 0.1
      };
    },
    // 下午 14-16 点
    afternoon_14_16: (width, height) => {
      const size = Math.floor(width * 0.58);
      return {
        size,
        x: size * 0.2,
        y: height / 2 - size * 1.75
      };
    },
    // 傍晚 17-19 点
    evening_17_19: (width, height) => {
      const size = Math.floor(width * 0.52);
      return {
        size,
        x: size * 0.1,
        y: height / 2 - size * 1.7
      };
    },
    // 夜晚 20-23 点
    night_20_23: (width, height) => {
      const size = Math.floor(width * 0.48);
      return {
        size,
        x: -size * 0.3,
        y: height / 2 - size * 1.4
      };
    }
  };
  var getStrategyKey = (hour) => {
    if (hour <= 3) {
      return "night_0_3";
    }
    if (hour <= 7) {
      return "morning_4_7";
    }
    if (hour <= 11) {
      return "morning_8_11";
    }
    if (hour <= 14) {
      return "noon_12_14";
    }
    if (hour <= 16) {
      return "afternoon_14_16";
    }
    if (hour <= 19) {
      return "evening_17_19";
    }
    return "night_20_23";
  };
  var renderChineseHourCharacter = (canvas) => {
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    const hour = (/* @__PURE__ */ new Date()).getHours();
    const character = get_chinese_hour_character_default(hour);
    const img = getImage(chinese_hour_characters_default[character]);
    const key = getStrategyKey(hour);
    const strategy = LAYOUT_STRATEGIES[key];
    const { size, x, y } = strategy(width, height);
    render_image_default(canvas, { img, x, y, size });
  };
  var render_chinese_hour_character_default = renderChineseHourCharacter;

  // lib/services/ui/board/render-board.js
  var renderBoard = (canvas, board) => {
    const { rows, cols } = canvas;
    clear_board_default(canvas);
    render_chinese_hour_character_default(canvas);
    render_scene_background_default(canvas, "playing");
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (board[y][x]) {
          render_block_default(canvas, x, y, board[y][x]);
        }
      }
    }
  };
  var render_board_default = renderBoard;

  // lib/services/ui/board/render-active-pieces.js
  var renderActivePieces = (canvas, curr, cx, cy) => {
    const { shape, color } = curr;
    const { length } = shape;
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          render_block_default(canvas, cx + x, cy + y, color);
        }
      }
    }
    return true;
  };
  var render_active_pieces_default = renderActivePieces;

  // lib/services/ui/board/render-active-only.js
  var renderActiveOnly = (canvas, state) => {
    const { board, curr, cx, cy } = state;
    if (board) {
      render_board_default(canvas, board);
    }
    if (curr) {
      render_active_pieces_default(canvas, curr, cx, cy);
    }
  };
  var render_active_only_default = renderActiveOnly;

  // lib/services/ui/scenes/paused-scene/render-paused.js
  var renderPaused = (canvas, state) => {
    clear_board_default(canvas);
    render_active_only_default(canvas, state);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "paused");
    render_tetris_text_default(canvas);
    render_digital_clock_default(canvas);
    render_analog_clock_default(canvas);
    render_paused_text_default(canvas);
  };
  var render_paused_default = renderPaused;

  // lib/services/ui/scenes/paused-scene/index.js
  var pausedScene = (canvas, state) => {
    render_paused_default(canvas, state);
  };
  var paused_scene_default = pausedScene;

  // lib/services/ui/text/render-game-text.js
  var renderGameText = (canvas) => {
    const { RED: RED6, YELLOW: YELLOW6 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "GAME",
      x: width / 2,
      y: height / 1.8,
      color: RED6,
      strokeColor: YELLOW6,
      size: 2.3,
      center: true,
      stroke: true
    });
  };
  var render_game_text_default = renderGameText;

  // lib/services/ui/text/render-over-text.js
  var renderOverText = (canvas) => {
    const { RED: RED6, YELLOW: YELLOW6 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "OVER",
      x: width / 2,
      y: height / 1.6,
      color: RED6,
      strokeColor: YELLOW6,
      size: 2.3,
      center: true,
      stroke: true
    });
  };
  var render_over_text_default = renderOverText;

  // lib/services/ui/scenes/game-over-scene/render-game-over.js
  var renderGameOver = (canvas, state) => {
    clear_board_default(canvas);
    render_active_only_default(canvas, state);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "game-over");
    render_tetris_text_default(canvas);
    render_game_text_default(canvas);
    render_over_text_default(canvas);
    render_enter_start_text_default(canvas);
  };
  var render_game_over_default = renderGameOver;

  // lib/services/ui/scenes/game-over-scene/index.js
  var gameOverScene = (canvas, state) => {
    render_game_over_default(canvas, state);
  };
  var game_over_scene_default = gameOverScene;

  // lib/services/ui/next/clear-next-piece.js
  var clearNextPiece = (canvas) => {
    const { nextPiece, nextPieceContext } = canvas;
    const { width, height } = nextPiece;
    nextPieceContext.clearRect(0, 0, width, height);
  };
  var clear_next_piece_default = clearNextPiece;

  // lib/services/ui/next/render-next-piece.js
  var renderNextPiece = (canvas, state) => {
    const { next } = state;
    const { RGBA_BLACK: RGBA_BLACK2 } = colors_default;
    const { nextPiece, nextPieceContext: ctx } = canvas;
    const { width, height } = nextPiece;
    if (!next) {
      return;
    }
    const { shape } = next;
    const gridSize = 5;
    const blockSize = Math.floor(width / gridSize);
    const ox = Math.floor((width - shape[0].length * blockSize) / 2);
    const oy = Math.floor((height - shape.length * blockSize) / 2);
    clear_next_piece_default(canvas);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) {
          continue;
        }
        const gap = 1;
        const size = blockSize - gap;
        const px = ox + x * blockSize + gap;
        const py = oy + y * blockSize + gap;
        ctx.fillStyle = next.color;
        ctx.fillRect(px, py, size, size);
        ctx.strokeStyle = RGBA_BLACK2;
        ctx.strokeRect(px, py, size, size);
      }
    }
  };
  var render_next_piece_default = renderNextPiece;

  // lib/services/ui/scenes/playing-scene/render-playing.js
  var renderPlaying = (canvas, state) => {
    render_active_only_default(canvas, state);
    render_next_piece_default(canvas, state);
  };
  var render_playing_default = renderPlaying;

  // lib/services/ui/scenes/playing-scene/index.js
  var playingScene = (canvas, state) => {
    render_playing_default(canvas, state);
  };
  var playing_scene_default = playingScene;

  // lib/services/ui/scenes/replay-scene/render-replay.js
  var renderReplay = (canvas, state) => {
    clear_board_default(canvas);
    render_playing_default(canvas, state);
    render_overlay_default(canvas);
    render_scene_background_default(canvas, "game-over");
    render_tetris_text_default(canvas);
    render_game_text_default(canvas);
    render_over_text_default(canvas);
    render_enter_start_text_default(canvas);
  };
  var render_replay_default = renderReplay;

  // lib/services/ui/scenes/replay-scene/index.js
  var replayScene = (canvas, state) => {
    render_replay_default(canvas, state);
  };
  var replay_scene_default = replayScene;

  // lib/services/ui/scenes/index.js
  var Scenes = {
    /**
     * ## 主菜单场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    "main-menu": (canvas, state) => {
      main_menu_scene_default(canvas, state);
    },
    /**
     * ## 难度选择
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    difficulty: (canvas, state) => {
      difficulty_scene_default(canvas, state);
    },
    /**
     * ## 游戏进行中场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    playing: (canvas, state) => {
      playing_scene_default(canvas, state);
    },
    /**
     * ## 暂停场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    paused: (canvas, state) => {
      paused_scene_default(canvas, state);
    },
    /**
     * ## 游戏结束场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    "game-over": (canvas, state) => {
      game_over_scene_default(canvas, state);
    },
    /**
     * ## 游戏回放场景
     *
     * @param {object} canvas - 游戏 canvas 信息对象
     * @param {object} state 游戏状态
     */
    replay: (canvas, state) => {
      replay_scene_default(canvas, state);
    }
  };
  var scenes_default = Scenes;

  // lib/services/ui/scene-manager/render-scene.js
  var renderScene = (canvas, state) => {
    const { mode } = state;
    const scene = scenes_default[mode];
    if (!scene) {
      return;
    }
    scene(canvas, state);
  };
  var render_scene_default = renderScene;

  // lib/services/ui/scene-manager/lazy-render-scene.js
  var lazyRenderScene = (canvas, state) => {
    if (document?.fonts?.load) {
      document.fonts.load('40px "Press Start 2P"').then(() => {
        render_scene_default(canvas, state);
      });
    } else {
      setTimeout(() => {
        render_scene_default(canvas, state);
      }, 150);
    }
  };
  var lazy_render_scene_default = lazyRenderScene;

  // lib/services/ui/board/render-clear.js
  var renderClear = (canvas, state) => {
    const { gameBoardContext: ctx, cols } = canvas;
    for (const line of state.lines) {
      ctx.save();
      ctx.globalAlpha = line.alpha;
      for (let x = 0; x < cols; x++) {
        render_block_default(canvas, x, line.y, line.color);
      }
      ctx.restore();
    }
  };
  var render_clear_default = renderClear;

  // lib/services/ui/text/render-countdown-text.js
  var renderCountdownText = (canvas, count, scale = 1) => {
    const { YELLOW: YELLOW6, BLACK: BLACK2 } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const { gameBoard, gameBoardContext: ctx, fontSize } = canvas;
    const { width, height } = gameBoard;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.font = `${fontSize * 3.25}px ${FONT_FAMILY2}`;
    ctx.fillStyle = YELLOW6;
    ctx.strokeStyle = BLACK2;
    ctx.lineWidth = 6;
    const text = String(count);
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };
  var render_countdown_text_default = renderCountdownText;

  // lib/services/ui/text/render-get-ready-text.js
  var renderGetReadyText = (canvas) => {
    const { GREEN: GREEN7, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "GET READY!",
      x: width / 2,
      y: height / 1.46,
      color: GREEN7,
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

  // lib/services/ui/image/render-gamepad.js
  var renderGamepad = (canvas) => {
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    const img = getImage(scenes_background_default.gamepad);
    const size = Math.floor(width * 0.54);
    const x = width / 2 - size / 2;
    const y = height / 2 - size * 1.2;
    render_image_default(canvas, { img, x, y, size });
  };
  var render_gamepad_default = renderGamepad;

  // lib/services/ui/effects/render-countdown.js
  var renderCountdown = (canvas, state) => {
    const { number, scale } = state;
    clear_board_default(canvas);
    render_overlay_default(canvas);
    render_tetris_text_default(canvas);
    render_scene_background_default(canvas, "countdown");
    render_gamepad_default(canvas);
    render_get_ready_text_default(canvas);
    render_countdown_text_default(canvas, number, scale);
  };
  var render_countdown_default = renderCountdown;

  // lib/services/ui/effects/render-fireworks.js
  var renderFireworks = (canvas, fireworks) => {
    const { gameBoardContext: ctx } = canvas;
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

  // lib/services/ui/text/render-level-up-text.js
  var renderLevelUpText = (canvas) => {
    const { GREEN: GREEN7 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "LEVEL UP",
      x: width / 2,
      y: height / 2.5,
      color: GREEN7,
      size: 1.2,
      center: true
    });
  };
  var render_level_up_text_default = renderLevelUpText;

  // lib/services/ui/text/render-congrats-text.js
  var renderCongratsText = (canvas) => {
    const { YELLOW: YELLOW6, BLACK: BLACK2 } = colors_default;
    const { gameBoard } = canvas;
    const { width, height } = gameBoard;
    render_text_default(canvas, {
      text: "CONGRATS!",
      x: width / 2,
      y: height / 1.6,
      color: YELLOW6,
      stroke: true,
      strokeColor: BLACK2,
      lineWidth: 3,
      size: 1.3,
      center: true
    });
  };
  var render_congrats_text_default = renderCongratsText;

  // lib/services/ui/effects/render-level-up.js
  function renderLevelUp(canvas, level, fireworks) {
    const { gameBoard } = canvas;
    const { height } = gameBoard;
    render_overlay_default(canvas);
    render_tetris_text_default(canvas);
    render_level_up_text_default(canvas);
    render_level_number_default(canvas, level, height / 1.85);
    render_congrats_text_default(canvas);
    render_fireworks_default(canvas, fireworks);
  }
  var render_level_up_default = renderLevelUp;

  // lib/services/ui/core/resize.js
  var resize = (canvas) => {
    const { gameBoard, nextPiece, rows, cols } = canvas;
    const h = globalThis.innerHeight * 0.9;
    canvas.blockSize = Math.floor(h / rows);
    gameBoard.width = canvas.blockSize * cols;
    gameBoard.height = canvas.blockSize * rows;
    canvas.fontSize = Math.floor(gameBoard.height * 0.032);
    const nextSize = Math.min(
      globalThis.innerWidth * 0.1,
      globalThis.innerHeight * 0.18
    );
    nextPiece.width = nextSize;
    nextPiece.height = nextSize;
  };
  var resize_default = resize;

  // lib/services/ui/hud/create-hud.js
  var setText = (el, value, pad = 0) => el.textContent = pad ? pad_start_default(value, pad) : String(value);
  var animationScore = (tracker, element, padding) => {
    if (tracker.visual === tracker.target) {
      return;
    }
    const diff = tracker.target - tracker.visual;
    const step = Math.ceil(Math.abs(diff) * 0.1);
    if (diff > 0) {
      tracker.visual += step;
      if (tracker.visual > tracker.target) {
        tracker.visual = tracker.target;
      }
    } else {
      tracker.visual -= step;
      if (tracker.visual < tracker.target) {
        tracker.visual = tracker.target;
      }
    }
    setText(element, tracker.visual, padding);
  };
  var createHud = (HudElements2) => {
    const scoreTracker = { visual: 0, target: 0 };
    const highScoreTracker = { visual: 0, target: 0 };
    const prev = { lines: -1, level: -1 };
    return {
      update: (state) => {
        scoreTracker.target = Number(state.score) || 0;
        highScoreTracker.target = Number(state.highScore) || 0;
        if (state.lines !== prev.lines) {
          setText(HudElements2.lines, state.lines, 2);
          prev.lines = state.lines;
        }
        if (state.level !== prev.level) {
          setText(HudElements2.level, state.level, 2);
          prev.level = state.level;
        }
      },
      tick: () => {
        animationScore(scoreTracker, HudElements2.score, 5);
        animationScore(highScoreTracker, HudElements2.highScore, 5);
      },
      reset: () => {
        scoreTracker.visual = 0;
        scoreTracker.target = 0;
        highScoreTracker.visual = 0;
        highScoreTracker.target = 0;
        prev.lines = -1;
        prev.level = -1;
        setText(HudElements2.score, 0, 5);
        setText(HudElements2.highScore, 0, 5);
        setText(HudElements2.lines, 0, 2);
        setText(HudElements2.level, 1, 2);
      }
    };
  };
  var create_hud_default = createHud;

  // lib/services/ui/index.js
  var UI = class extends core_default {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.initialize(options);
    }
    initialize(options) {
      const { Elements } = options;
      const { Hud, Main } = Elements;
      this.Hud = create_hud_default(hud_elements_default(Hud));
      this.Canvas = new canvas_default(Main);
    }
    updateMode(mode) {
      this.Canvas.gameBoard.dataset.mode = mode;
    }
    updateHud() {
      const state = this.Store.getState();
      const { mode, score, lines, level, highScore, needReset = false } = state;
      if (mode === "main-menu" || needReset) {
        this.Hud.reset();
      }
      this.Hud.update({
        score,
        lines,
        level,
        highScore
      });
    }
    tickHud(delta) {
      this.Hud.tick(delta);
    }
    lazyRender() {
      const state = this.Store.getState();
      lazy_render_scene_default(this.Canvas, state);
    }
    render() {
      const state = this.Store.getState();
      render_scene_default(this.Canvas, state);
    }
    resize() {
      resize_default(this.Canvas);
    }
    subscribe() {
      const uuid = this.Game.id;
      this.on(`ui:${uuid}:update:mode`, this._onUpdateMode);
      this.on(`ui:${uuid}:update:hud`, this._onUpdateHud);
      this.on(`ui:${uuid}:resize`, this._onResize);
      this.on(`ui:${uuid}:render:next:piece`, this._onRenderNextPiece);
      this.on(`ui:${uuid}:render:countdown`, this._onRenderCountdown);
      this.on(`ui:${uuid}:render:clear`, this._onRenderClear);
      this.on(`ui:${uuid}:render:level:up`, this._onRenderLevelUp);
    }
    unsubscribe() {
      const uuid = this.Game.id;
      this.off(`ui:${uuid}:update:mode`, this._onUpdateMode);
      this.off(`ui:${uuid}:update:hud`, this._onUpdateHud);
      this.off(`ui:${uuid}:resize`, this._onResize);
      this.off(`ui:${uuid}:render:next:piece`, this._onRenderNextPiece);
      this.off(`ui:${uuid}:render:countdown`, this._onRenderCountdown);
      this.off(`ui:${uuid}:render:clear`, this._onRenderClear);
      this.off(`ui:${uuid}:render:level:up`, this._onRenderLevelUp);
    }
    _onUpdateMode = ({ mode }) => {
      this.updateMode(mode);
    };
    _onUpdateHud = () => {
      const state = this.Store.getState();
      this.updateHud(state);
    };
    _onResize = () => {
      this.resize();
    };
    _onRenderNextPiece = () => {
      const state = this.Store.getState();
      render_next_piece_default(this.Canvas, state);
    };
    _onRenderCountdown = ({ state }) => {
      render_countdown_default(this.Canvas, state);
    };
    _onRenderClear = ({ state }) => {
      render_clear_default(this.Canvas, state);
    };
    _onRenderLevelUp = ({ level, fireworks }) => {
      render_level_up_default(this.Canvas, level, fireworks);
    };
  };
  var ui_default = UI;

  // lib/services/input/keyboard-controller.js
  var KEYBOARDS_ACTION_MAP = {
    arrowleft: "MOVE_LEFT",
    arrowright: "MOVE_RIGHT",
    arrowdown: "MOVE_DOWN",
    arrowup: "ROTATE",
    " ": "DROP",
    m: "TOGGLE_MUSIC",
    p: "TOGGLE_PAUSED",
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
    e: "EASY",
    n: "NORMAL",
    h: "HARD",
    x: "EXPERT",
    b: "BACK",
    enter: "CONFIRM"
  };
  var resolveKeyboardAction = (key) => {
    if (!key) {
      return;
    }
    const normalizedKey = key.toLowerCase();
    return KEYBOARDS_ACTION_MAP[normalizedKey];
  };
  var Keyboard = class extends core_default {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
    }
    /**
     * ## 绑定游戏中键盘操作相关的事件
     *
     * @returns {Keyboard} - 返回 KeyboardController 对象，可链式调用
     */
    addEventListeners() {
      globalThis.addEventListener("resize", this._onResize);
      document.addEventListener("keydown", this._onKeydown);
      return this;
    }
    /**
     * ## 解除游戏中键盘操作相关的事件绑定
     *
     * @returns {Keyboard} - 返回 KeyboardController 对象，可链式调用
     */
    removeEventListeners() {
      globalThis.removeEventListener("resize", this._onResize);
      document.removeEventListener("keydown", this._onKeydown);
      return this;
    }
    /**
     * ## resize 事件的功能函数
     *
     * @private
     * @returns {Keyboard} - 返回 KeyboardController 对象，可链式调用
     */
    _onResize = () => {
      this.emit(`ui:${this.Game.id}:resize`);
      return this;
    };
    /**
     * ## keydown 事件的功能函数
     *
     * @private
     * @param {Event} e - 事件对象
     * @param {string} e.key - 事件名称
     * @returns {Keyboard} - 返回 KeyboardController 对象，可链式调用
     */
    _onKeydown = (e) => {
      const { Game: Game2, Store } = this;
      const key = e.key?.toLowerCase();
      if (!key) {
        return this;
      }
      const action = resolveKeyboardAction(key);
      const mode = Store.getMode();
      if (!action || mode === "replay" && key !== "enter") {
        return this;
      }
      this.emit("dispatch:input", {
        device: "keyboard",
        action,
        payload: {
          Game: Game2
        }
      });
      return this;
    };
  };
  var keyboard_default = Keyboard;

  // lib/services/input/gamepad-controller.js
  var GAMEPAD_ACTION_MAP = {
    A: "TOGGLE_MUSIC",
    B: "DROP",
    X: "RESTART",
    Y: "TOGGLE_PAUSE",
    START: "CONFIRM",
    BACK: "QUIT",
    DPAD_LEFT: "MOVE_LEFT",
    DPAD_RIGHT: "MOVE_RIGHT",
    DPAD_DOWN: "MOVE_DOWN",
    DPAD_UP: "ROTATE"
  };
  var LEVELS = [
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIX",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN"
  ];
  var STANDARD_BTN_MAP = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
    BACK: 8,
    START: 9,
    DPAD_UP: 12,
    DPAD_DOWN: 13,
    DPAD_LEFT: 14,
    DPAD_RIGHT: 15
  };
  var BETOP_20BC_1263_BTN_MAP = {
    A: 2,
    B: 1,
    X: 3,
    Y: 0,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
    BACK: 8,
    START: 9
  };
  var GamepadController = class extends core_default {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.activeGamepadIndex = null;
      this.DEAD_ZONE = 0.15;
      this.DPAD_THRESHOLD = 0.5;
      this.buttonStates = {};
      this.axisStates = {};
      this._eventsBound = false;
      this.DPAD_COOLDOWN = 180;
      this.lastDpadTime = 0;
      this.curBtnMap = STANDARD_BTN_MAP;
      this.dpadAxisState = {
        up: false,
        down: false,
        left: false,
        right: false
      };
      this.AXIS_MAP = {
        LEFT_STICK_X: 0,
        LEFT_STICK_Y: 1
      };
    }
    /**
     * ## 每帧调用
     *
     * 流程：
     *
     * 1. 刷新 Gamepad snapshot
     * 2. 如果存在 active gamepad
     * 3. 收集输入 → dispatch
     *
     * @param {number} now - 当前时间的时间戳
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    update(now) {
      this._refreshGamepadState();
      if (!this.activeGamepad) {
        return this;
      }
      this._collectCommands(now);
      return this;
    }
    /**
     * ## 绑定 Gamepad 连接事件
     *
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    addEventListeners() {
      if (this._eventsBound) {
        return this;
      }
      globalThis.addEventListener("gamepadconnected", this._onConnect);
      globalThis.addEventListener("gamepaddisconnected", this._onDisconnect);
      this._eventsBound = true;
      return this;
    }
    /**
     * ## 销毁事件绑定
     *
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    removeEventListeners() {
      globalThis.removeEventListener("gamepadconnected", this._onConnect);
      globalThis.removeEventListener("gamepaddisconnected", this._onDisconnect);
      this._eventsBound = false;
      return this;
    }
    /**
     * ## 手柄连接
     *
     * - 设置 activeGamepad
     * - 自动识别 BETOP 并切换 mapping
     *
     * @param {object} e - 事件对象
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _onConnect = (e) => {
      const pad = e.gamepad;
      if (this.activeGamepadIndex !== null) {
        return this;
      }
      this.activeGamepadIndex = pad.index;
      this.curBtnMap = this._isBetop(pad.id) ? BETOP_20BC_1263_BTN_MAP : STANDARD_BTN_MAP;
      this.emit(`game:${this.Game.id}:update:gamepad:connected`, {
        connected: true
      });
      return this;
    };
    /**
     * ## 手柄断开
     *
     * - 清空状态
     *
     * @private
     * @param {object} e - 事件对象
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _onDisconnect = (e) => {
      if (this.activeGamepadIndex !== e.gamepad.index) {
        return this;
      }
      this.activeGamepadIndex = null;
      this.buttonStates = {};
      this.axisStates = {};
      this.emit(`game:${this.Game.id}:update:gamepad:connected`, {
        connected: false
      });
      return this;
    };
    /**
     * ## 判断是否为 BETOP（北通） 手柄
     *
     * @param {string} id - 手柄 id 字符串
     * @returns {boolean} - 返回判断结果，是北通返回 true，否则返回 false
     */
    _isBetop(id) {
      return id.includes("20bc") && id.includes("1263");
    }
    /**
     * ## 刷新 Gamepad 状态
     *
     * - 必须每帧调用 navigator.getGamepads()
     * - 因为 Gamepad 对象是 snapshot，不是实时引用
     *
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _refreshGamepadState() {
      const pads = navigator.getGamepads?.() || [];
      if (this.activeGamepadIndex === null) {
        const firstPad = Array.from(pads).find(Boolean);
        if (firstPad) {
          this.activeGamepadIndex = firstPad.index;
          this.curBtnMap = this._isBetop(firstPad.id) ? BETOP_20BC_1263_BTN_MAP : STANDARD_BTN_MAP;
        }
      }
      this.activeGamepad = this.activeGamepadIndex === null ? null : pads[this.activeGamepadIndex];
      return this;
    }
    /**
     * ## 根据游戏当前模式更新按键的响应动作
     *
     * @private
     * @param {string} mode - 游戏模式
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _updateActionMap(mode) {
      switch (mode) {
        case "difficulty": {
          GAMEPAD_ACTION_MAP.A = "EASY";
          GAMEPAD_ACTION_MAP.B = "NORMAL";
          GAMEPAD_ACTION_MAP.Y = "HARD";
          GAMEPAD_ACTION_MAP.X = "EXPERT";
          GAMEPAD_ACTION_MAP.BACK = "BACK";
          break;
        }
        case "playing": {
          GAMEPAD_ACTION_MAP.A = "TOGGLE_MUSIC";
          GAMEPAD_ACTION_MAP.B = "DROP";
          GAMEPAD_ACTION_MAP.X = "RESTART";
          GAMEPAD_ACTION_MAP.Y = "TOGGLE_PAUSE";
          break;
        }
      }
      return this;
    }
    /**
     * ## 解析手柄按钮的响应动作名称
     *
     * @private
     * @param {string} action - 按键执行动作名称
     * @param {string} btnName - 按键名称
     * @param {boolean} isDPad - 是否为 DPad 方向键
     * @param {string} mode - 游戏当前模式
     * @param {string} level - 游戏当前等级
     * @param {number} now - 当前时间的时间戳
     * @returns {string} - 返回解析后的按键执行动作名称
     */
    _resolveAction(action, btnName, isDPad, mode, level, now) {
      if (!isDPad || mode !== "main-menu") {
        return action;
      }
      if (now - this.lastDpadTime < this.DPAD_COOLDOWN) {
        return "";
      }
      this.lastDpadTime = now;
      if (btnName === "DPAD_UP") {
        return this._getMoveUpAction(mode, level);
      }
      if (btnName === "DPAD_DOWN") {
        return this._getMoveDownAction(mode, level);
      }
      return action;
    }
    /**
     * ## 处理标准游戏手柄的按钮响应
     *
     * @private
     * @param {object} pad - Gamepad 对象
     * @param {string} mode - 游戏当前模式
     * @param {string} level - 游戏当前级别
     * @param {number} now - 当前时间的时间戳
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _handleStandardButtons(pad, mode, level, now) {
      const isBetop = this._isBetop(pad.id);
      const isBlockedMode = mode === "replay" || mode === "game-over";
      const { Game: Game2 } = this;
      for (const [btnName, action] of Object.entries(GAMEPAD_ACTION_MAP)) {
        const isDPad = btnName.startsWith("DPAD_");
        if (!this._isPressed(btnName)) {
          continue;
        }
        if (isBetop && isDPad) {
          continue;
        }
        if (isBlockedMode && btnName !== "START") {
          return this;
        }
        const finalAction = this._resolveAction(
          action,
          btnName,
          isDPad,
          mode,
          level,
          now
        );
        if (!finalAction) {
          continue;
        }
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action: finalAction,
          payload: { Game: Game2 }
        });
      }
      return this;
    }
    /**
     * ## 收集所有输入
     *
     * - 转换为 Command（通过 dispatchInput）
     *
     * @private
     * @param {number} now - 当前时间的时间戳
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _collectCommands(now) {
      const state = this.Store.getState();
      const { mode, level } = state;
      const pad = this.activeGamepad;
      if (!pad) {
        return this;
      }
      this._updateActionMap(mode);
      this._handleStandardButtons(pad, mode, level, now);
      if (mode === "replay" || mode === "game-over") {
        return this;
      }
      const x = this._getAxis(this.AXIS_MAP.LEFT_STICK_X);
      const y = this._getAxis(this.AXIS_MAP.LEFT_STICK_Y);
      this._handleStickMove(x, y);
      if (this._isBetop(pad.id)) {
        const dpadVal = pad.axes[9] ?? 0;
        this._handleBetopDpad(dpadVal, state);
      }
      return this;
    }
    /**
     * ## 开始轴动作（触发一次）
     *
     * 仅在未触发时触发 dispatch
     *
     * @param {string} action - 动作名称
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _startAxisAction(action) {
      if (this.axisStates[action]) {
        return this;
      }
      const { Game: Game2 } = this;
      this.axisStates[action] = true;
      this.emit(`dispatch:input`, {
        device: "gamepad",
        action,
        payload: { Game: Game2 }
      });
      return this;
    }
    /**
     * ## 停止轴动作（重置状态）
     *
     * @param {string} action - 动作名称
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _stopAxisAction(action) {
      this.axisStates[action] = false;
      return this;
    }
    _handleStickUp(y) {
      if (y < -this.DPAD_THRESHOLD) {
        this._startAxisAction("ROTATE");
      } else {
        this._stopAxisAction("ROTATE");
      }
      return this;
    }
    _handleStickDown(y) {
      if (y > this.DPAD_THRESHOLD) {
        this._startAxisAction("MOVE_DOWN");
      } else {
        this._stopAxisAction("MOVE_DOWN");
      }
      return this;
    }
    _handleStickLeft(x) {
      if (x < -this.DPAD_THRESHOLD) {
        this._startAxisAction("MOVE_LEFT");
      } else {
        this._stopAxisAction("MOVE_LEFT");
      }
      return this;
    }
    _handleStickRight(x) {
      if (x > this.DPAD_THRESHOLD) {
        this._startAxisAction("MOVE_RIGHT");
      } else {
        this._stopAxisAction("MOVE_RIGHT");
      }
      return this;
    }
    /**
     * ## 摇杆移动处理（带防抖）
     *
     * @param {number} x - X轴偏移数值
     * @param {number} y - Y轴偏移数值
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _handleStickMove(x, y) {
      this._handleStickUp(y);
      this._handleStickDown(y);
      this._handleStickLeft(x);
      this._handleStickRight(x);
      return this;
    }
    _getMoveUpAction(mode, level) {
      let action;
      if (mode === "main-menu") {
        level += 1;
        if (level >= 10) {
          level = 10;
        }
        this.emit(`game:${this.Game.id}:update:level`, { level });
        action = `LEVEL_${LEVELS[level - 1]}`;
      } else {
        action = "ROTATE";
      }
      return action;
    }
    _getMoveDownAction(mode, level) {
      let action;
      if (mode === "main-menu") {
        level -= 1;
        if (level <= 1) {
          level = 1;
        }
        this.emit(`game:${this.Game.id}:update:level`, { level });
        action = `LEVEL_${LEVELS[level - 1]}`;
      } else {
        action = "MOVE_DOWN";
      }
      return action;
    }
    _handleBetopDpadUp(mode, level, st) {
      const action = this._getMoveUpAction(mode, level);
      const { Game: Game2 } = this;
      if (!st.up) {
        st.up = true;
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action,
          payload: { Game: Game2 }
        });
      }
      st.down = st.left = st.right = false;
      return this;
    }
    _handleBetopDpadDown(mode, level, st) {
      const action = this._getMoveDownAction(mode, level);
      const { Game: Game2 } = this;
      if (!st.down) {
        st.down = true;
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action,
          payload: { Game: Game2 }
        });
      }
      st.up = st.left = st.right = false;
      return this;
    }
    _handleBetopDpadLeft(st) {
      const { Game: Game2 } = this;
      if (!st.left) {
        st.left = true;
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action: "MOVE_LEFT",
          payload: { Game: Game2 }
        });
      }
      st.up = st.down = st.right = false;
      return this;
    }
    _handleBetopDpadRight(st) {
      const { Game: Game2 } = this;
      if (!st.right) {
        st.right = true;
        this.emit(`dispatch:input`, {
          device: "gamepad",
          action: "MOVE_RIGHT",
          payload: { Game: Game2 }
        });
      }
      st.up = st.down = st.left = false;
      return this;
    }
    /**
     * ## BETOP DPAD（axis9）解析
     *
     * 不同方向对应固定浮点值
     *
     * @param {number} val - 按键的值
     * @param {object} state - 游戏状态信息
     * @returns {GamepadController} - 返回 GamepadController 对象，可链式调用
     */
    _handleBetopDpad(val, state) {
      const { mode, level } = state;
      const v = val.toFixed(5);
      const st = this.dpadAxisState;
      const now = Date.now();
      if (mode === "main-menu" && now - this.lastDpadTime < this.DPAD_COOLDOWN) {
        return this;
      }
      switch (v) {
        // 上
        case "-1.00000": {
          this._handleBetopDpadUp(mode, level, st);
          this.lastDpadTime = now;
          break;
        }
        // 下
        case "0.14286": {
          this._handleBetopDpadDown(mode, level, st);
          this.lastDpadTime = now;
          break;
        }
        // 左
        case "0.71429": {
          this._handleBetopDpadLeft(st);
          this.lastDpadTime = now;
          break;
        }
        // 右
        case "-0.42857": {
          this._handleBetopDpadRight(st);
          this.lastDpadTime = now;
          break;
        }
        // 松开手柄充值状态
        default: {
          st.up = st.down = st.left = st.right = false;
          break;
        }
      }
      return this;
    }
    /**
     * ## 获取轴值（带 dead zone）
     *
     * @param {number} index - 索引值
     * @returns {number} - 返回获取的轴值
     */
    _getAxis(index) {
      if (!this.activeGamepad) {
        return 0;
      }
      const val = this.activeGamepad.axes[index] ?? 0;
      return Math.abs(val) > this.DEAD_ZONE ? val : 0;
    }
    /**
     * ## 判断按钮是否“刚按下”（防抖）
     *
     * @param {string} btnName - 按钮名称
     * @returns {boolean} - 按钮按下返回 true，否则返回 false
     */
    _isPressed(btnName) {
      const idx = this.curBtnMap[btnName];
      if (idx === void 0 || !this.activeGamepad) {
        return false;
      }
      const btn = this.activeGamepad.buttons[idx];
      if (!btn) {
        return false;
      }
      const pressed = btn.value > 0.5;
      if (pressed && !this.buttonStates[btnName]) {
        this.buttonStates[btnName] = true;
        return true;
      }
      if (!pressed) {
        this.buttonStates[btnName] = false;
      }
      return false;
    }
  };
  var gamepad_controller_default = GamepadController;

  // lib/runtime/replay-controller.js
  var ReplayController = class extends core_default {
    /**
     * ## 是否有录制的回放数据。
     *
     * @returns {boolean} - 有回放数据，返回 true，否则返回 false
     */
    get hasData() {
      return this.data.length > 0;
    }
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.recording = false;
      this.playing = false;
      this.data = [];
      this.cursor = 0;
      this.pieceSequence = [];
      this.pieceIndex = 0;
      this.playElapsed = 0;
      this.startTime = 0;
      this.timestamp = 0;
    }
    getNextPiece() {
      if (!this.playing) {
        return { curr: null, next: null };
      }
      const piece = this.pieceSequence[this.pieceIndex++];
      if (!piece) {
        return { curr: null, next: null };
      }
      const next = this.pieceSequence[this.pieceIndex] || null;
      return { curr: piece, next };
    }
    /**
     * ## 同步回放逻辑时钟。
     *
     * 计算当前 wall-clock 时间与 startTime 的差值作为回放进度。 如果检测到时间跳跃过大（标签页切后台），限制单次跳跃上限。
     *
     * @param {object} ctx - 执行上下文对象
     * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
     * @param {boolean} ctx.isBlocked - 是否处于暂停/阻塞状态
     */
    syncPlayElapsed({ timestamp, isBlocked }) {
      if (!this.playing || isBlocked) return;
      const prev = this.playElapsed;
      const now = timestamp - this.startTime;
      const delta = now - prev;
      if (delta > 1e3) {
        this.startTime += delta - 1e3;
        this.playElapsed = prev + 1e3;
      } else {
        this.playElapsed = now;
      }
    }
    /**
     * ## 每帧调用，驱动回放逻辑
     *
     * 执行流程：
     *
     * 1. 更新当前 timestamp
     * 2. 检查回放是否结束
     * 3. 如有需要，快进跳过长时间等待（标签页切回后）
     * 4. 将所有逻辑时间已到的 command 逐条注入 EventBus
     *
     * @param {object} ctx - 执行上下文对象
     * @param {Function} ctx.speed - 获取当前下落间隔（ms），用于快进阈值计算
     * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
     */
    update({ speed, timestamp }) {
      const mode = this.Store.getMode();
      this.timestamp = timestamp;
      if (!this.playing || mode !== "replay") {
        return;
      }
      const { data } = this;
      if (data.length > 0 && this.cursor >= data.length) {
        this.stopPlay();
        return;
      }
      const next = data[this.cursor];
      if (next) {
        const interval = speed ?? 1e3;
        const gap = next.ms - this.playElapsed;
        if (gap > interval * 2) {
          const skip = Math.min(gap - interval, 1e3);
          this.playElapsed += skip;
          this.startTime = timestamp - this.playElapsed;
        }
      }
      while (this.playing && this.cursor < data.length && data[this.cursor].ms <= this.playElapsed) {
        const { cmd } = data[this.cursor];
        this.emit(`dispatch:command`, cmd);
        this.cursor++;
      }
    }
    /**
     * ## 开始录制
     *
     * 行为：
     *
     * - 开启 recording 标志
     * - 清空旧数据和方块序列
     * - 将 startTime 设置为当前 timestamp
     */
    startRecord() {
      this.recording = true;
      this.data = [];
      this.pieceSequence = [];
      this.pieceIndex = 0;
      this.playElapsed = 0;
      this.startTime = this.timestamp;
    }
    /** ## 停止录制 */
    stopRecord() {
      this.recording = false;
    }
    /**
     * ## 开始回放
     *
     * 行为：
     *
     * - 开启 playing 标志
     * - 重置 cursor 和 pieceIndex
     * - 将 startTime 设置为当前 timestamp
     */
    startPlay() {
      this.playing = true;
      this.cursor = 0;
      this.pieceIndex = 0;
      this.startTime = this.timestamp;
    }
    /** ## 停止回放 */
    stopPlay() {
      this.playing = false;
      this.emit(`game:${this.Game.id}:update:mode`, { mode: "game-over" });
    }
    /**
     * ## 清除所有数据，重置标志位。
     *
     * 注意：不清除事件绑定，仅重置录制/回放相关状态。
     */
    clear() {
      this.recording = false;
      this.playing = false;
      this.cursor = 0;
      this.data = [];
      this.pieceSequence = [];
      this.pieceIndex = 0;
      this.startTime = 0;
    }
    /**
     * ## 停止录制/回放并清除所有数据。
     *
     * 等同于 stopRecord() + stopPlay() + clear()。
     */
    reset() {
      this.stopRecord();
      this.stopPlay();
      this.clear();
    }
    /**
     * ## 绑定所有事件监听
     *
     * 在游戏初始化时调用一次。
     */
    subscribe() {
      const uuid = this.Game.id;
      this.on(`replay:${uuid}:start:record`, this._onStartRecord);
      this.on(`replay:${uuid}:stop:record`, this._onStopRecord);
      this.on(`replay:${uuid}:add:record`, this._onAddRecord);
      this.on(`replay:${uuid}:add:piece`, this._onAddPiece);
      this.on(`replay:${uuid}:start:play`, this._onStartPlay);
      this.on(`replay:${uuid}:reset`, this._onReset);
      this.on(`replay:${uuid}:game:over`, this._onGameOver);
      this.on(`replay:${uuid}:stop:clear:lines`, this._onClearLines);
    }
    unsubscribe() {
      const uuid = this.Game.id;
      this.off(`replay:${uuid}:start:record`, this._onStartRecord);
      this.off(`replay:${uuid}:stop:record`, this._onStopRecord);
      this.off(`replay:${uuid}:add:record`, this._onAddRecord);
      this.off(`replay:${uuid}:add:piece`, this._onAddPiece);
      this.off(`replay:${uuid}:start:play`, this._onStartPlay);
      this.off(`replay:${uuid}:reset`, this._onReset);
      this.off(`replay:${uuid}:game:over`, this._onGameOver);
      this.off(`replay:${uuid}:stop:clear:lines`, this._onClearLines);
    }
    /**
     * ## 销毁实例
     *
     * 停止所有录制/回放、清除数据、解绑所有事件。 主要用于 AI 对战切换对手或完全卸载 replay 模块。
     */
    destroy() {
      this.reset();
      this.unsubscribe();
    }
    /** @private */
    _onStartRecord = () => {
      this.startRecord();
    };
    /** @private */
    _onStopRecord = () => {
      this.stopRecord();
    };
    /**
     * ## 录制一条 command
     *
     * 只在 recording 状态下写入。
     *
     * @private
     * @param {object} record - { ms, cmd }
     */
    _onAddRecord = (record) => {
      if (!this.recording) {
        return;
      }
      this.data.push(record);
    };
    /**
     * ## 录制一个方块。
     *
     * 只在 recording 状态下写入，使用深拷贝避免引用污染。
     *
     * @private
     * @param {object} piece - 方块数据
     */
    _onAddPiece = (piece) => {
      if (!this.recording) {
        return;
      }
      this.pieceSequence.push(structuredClone(piece));
    };
    /** @private */
    _onStartPlay = () => {
      this.startPlay();
    };
    /** @private */
    _onReset = () => {
      this.reset();
    };
    /**
     * ## 游戏结束时的处理。
     *
     * - 有回放数据：准备棋盘进入回放
     * - 无回放数据：直接进入 game-over 状态
     *
     * @private
     */
    _onGameOver = () => {
      const { Game: Game2 } = this;
      const uuid = Game2.id;
      if (this.hasData) {
        this.emit(`game:${uuid}:replay:prepare:board`, {
          nextPiece: this.getNextPiece()
        });
      } else {
        this.emit(`ui:${uuid}:update:mode`, { mode: "game-over" });
        this.emit(`game:${uuid}:update:mode`, { mode: "game-over" });
      }
    };
    /**
     * ## 消行时的处理
     *
     * 回放中不触发升级提示音/动画；录制或正常游戏中升级时触发。
     *
     * @private
     * @param {object} param - 参数对象
     * @param {boolean} param.isLevelUp - 是否升级
     * @param {number} param.level - 当前等级
     */
    _onClearLines = ({ isLevelUp, level }) => {
      if (!isLevelUp || this.playing) {
        return;
      }
      this.emit("audio:stop:bgm");
      this.emit("audio:resume:sound", { sound: "LEVEL_UP" });
      this.emit(`game:${this.Game.id}:start:level:up`, { level });
    };
  };
  var replay_controller_default = ReplayController;

  // lib/services/animations/countdown-animation.js
  var CountdownAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.initialize();
      this._countdown();
    }
    initialize() {
      this.layer = 100;
      this.blocking = true;
      this.name = "countdown";
      this.state = {
        show: true,
        number: 3,
        scale: 4,
        count: 0,
        acc: 0
      };
      this._intervalId = 0;
    }
    _countdown() {
      this.emit("audio:resume:sound", { sound: "COUNTDOWN" });
      this._intervalId = this.Scheduler.interval(() => {
        this.state.number -= 1;
        this.state.scale = 4;
        if (this.state.number >= 1) {
          this.emit("audio:resume:sound", { sound: "COUNTDOWN" });
        }
        if (this.state.number <= 0) {
          this.stop();
        }
      }, 1e3);
    }
    /**
     * ## 更新动画状态
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     * @returns {boolean} - 是否继续存活（true=继续，false=结束）
     */
    update(delta) {
      this.state.scale = Math.max(1, this.state.scale - delta * 40);
      return this.state.number > 0;
    }
    /**
     * ## 倒计时结束处理
     *
     * - 切换游戏状态为 playing
     * - 启动游戏主逻辑
     */
    stop() {
      const { Game: Game2 } = this;
      this.Scheduler.cancel(this._intervalId);
      this.emit(`game:${Game2.id}:begin`);
    }
    /**
     * ## 渲染动画
     *
     * 将当前 state 传递给渲染函数
     */
    render() {
      const { state, Game: Game2 } = this;
      this.emit(`ui:${Game2.id}:render:countdown`, { state });
    }
  };
  var countdown_animation_default = CountdownAnimation;

  // lib/services/animations/paused-animation.js
  var PausedAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.layer = 500;
      this.blocking = true;
      this.name = "paused";
      this.timer = 0;
      this.active = true;
      this._tickId = 0;
      this._tick();
    }
    _tick() {
      if (!this.active) {
        return;
      }
      this._tickId = this.Scheduler.interval(() => {
        this.emit("audio:resume:sound", { sound: "SECOND_TICK" });
      }, 1e3);
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
        this.emit("audio:resume:sound", { sound: "SECOND_TICK" });
        this.timer = 0;
      }
      return true;
    }
    resume() {
      this.active = true;
    }
    /**
     * ## 暂停结束处理
     *
     * 将活动状态 active 设置为 true
     */
    stop() {
      this.active = false;
      this.Scheduler.cancel(this._tickId);
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

  // lib/game/actions/apply-clear-lines.js
  var applyClearLines = (game) => {
    const { Elements, Level, Store } = game;
    const state = Store.getState();
    const { rows, cols } = Elements.Main;
    const { CLEAR_LINE_SCORES: CLEAR_LINE_SCORES2 } = game_default;
    const lines = state.clearLines || [];
    const cleared = lines.length;
    const board = structuredClone(state.board);
    for (let y = rows - 1; y >= 0; y--) {
      const isFullLine = board[y].every(Boolean);
      if (isFullLine) {
        board.splice(y, 1);
        board.unshift(Array.from({ length: cols }).fill(0));
        y++;
      }
    }
    const nextLines = state.lines + cleared;
    const totalLines = state.baseLines + nextLines;
    const newLevel = Math.floor(totalLines / 10) + 1;
    const { max } = Level;
    const isMaxOut = newLevel > max;
    const levelUp = newLevel > state.level && !isMaxOut;
    return {
      stateHandler: (prev) => ({
        ...prev,
        clearLines: [],
        lines: nextLines,
        score: prev.score + CLEAR_LINE_SCORES2[cleared],
        level: Math.min(Math.max(prev.level, newLevel), max),
        board
      }),
      levelUp,
      level: isMaxOut ? max : newLevel,
      isMaxOut
    };
  };
  var apply_clear_lines_default = applyClearLines;

  // lib/services/animations/clear-lines-animation.js
  var ClearLinesAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.initialize(options);
    }
    initialize(options) {
      const { lines } = options;
      this.layer = 200;
      this.blocking = true;
      this.name = "clear-lines";
      this.lines = lines.map((y) => ({
        y,
        alpha: 1,
        timer: 0
      }));
      this.emit("audio:resume:sound", {
        sound: "CLEAR",
        lines: lines.length - 1
      });
    }
    /**
     * ## 更新动画状态
     *
     * 每帧调用，用于：
     *
     * - 推进每一行的动画时间
     * - 根据 timer 计算当前闪烁状态（alpha）
     * - 判断动画是否结束
     *
     * @param {number} delta - 距离上一帧的时间差（单位：秒）
     * @returns {boolean} - 是否继续存活（true = 继续，false = 结束）
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
     * ## 动画结束后的收尾逻辑
     *
     * 包含：
     *
     * 1. 实际删除已满的行
     * 2. 更新分数与消除行数
     * 3. 判断并处理升级
     * 4. 更新 HUD
     */
    stop() {
      const { Game: Game2 } = this;
      const uuid = Game2.id;
      const result = apply_clear_lines_default(Game2);
      const { level, levelUp } = result;
      const isLevelUp = levelUp;
      engine_default.Scheduler.sequence([
        {
          fn: () => {
            this.emit(`replay:${uuid}:stop:clear:lines`, { isLevelUp, level });
          }
        },
        {
          fn: () => {
            this.emit(`game:${uuid}:update:state`, {
              stateHandler: result.stateHandler
            });
          }
        },
        {
          fn: () => {
            this.emit(`game:${uuid}:save:high:score`);
          }
        },
        {
          fn: () => {
            this.emit(`game:${uuid}:update:hud`);
          }
        }
      ]);
    }
    /**
     * ## 渲染动画
     *
     * 在渲染阶段调用：
     *
     * - 根据当前 lines 数据（含 alpha）绘制闪烁效果
     *
     * 不修改 state，仅负责视觉表现
     */
    render() {
      const { lines } = this;
      this.emit(`ui:${this.Game.id}:render:clear`, { state: { lines } });
    }
  };
  var clear_lines_animation_default = ClearLinesAnimation;

  // lib/services/ui/constants/firework-colors.js
  var { TEAL: TEAL4, YELLOW: YELLOW4, PURPLE: PURPLE4, ORANGE: ORANGE4, GREEN: GREEN5, RED: RED4 } = colors_default;
  var FIREWORK_COLORS = [TEAL4, YELLOW4, PURPLE4, ORANGE4, GREEN5, RED4];
  var firework_colors_default = FIREWORK_COLORS;

  // lib/services/animations/level-up-animation.js
  var LevelUpAnimation = class extends core_default {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.initialize(options);
    }
    initialize(options) {
      const { level } = options;
      this.layer = 100;
      this.blocking = true;
      this.name = "level-up";
      this.duration = 3;
      this.spawnTimer = 0;
      this.timer = 0;
      this.level = level;
      this.fireworks = this.createFireworks();
      this.active = true;
      const { Scheduler: Scheduler2 } = this;
      this._spawnId = Scheduler2.interval(() => {
        this.fireworks.push(...this.createFireworks());
      }, 600);
      this._endId = Scheduler2.delay(() => {
        this.stop();
      }, 3e3);
    }
    /**
     * ## 创建一组烟花粒子
     *
     * 在画布中心上方位置生成随机方向和速度的粒子
     *
     * @returns {object[]} 烟花粒子对象数组
     */
    createFireworks() {
      const { UI: UI2 } = this;
      const { width, height } = UI2.Canvas.gameBoard;
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
     * ## 更新动画状态
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
     */
    update(delta) {
      this.updateFireworks(delta);
      return this.active;
    }
    /**
     * ## 升级动画结束处理
     *
     * 继续播放背景音乐
     */
    stop() {
      const { level, Scheduler: Scheduler2 } = this;
      this.active = false;
      Scheduler2.cancel(this._spawnId);
      Scheduler2.cancel(this._endId);
      this.emit("audio:resume:bgm", { level });
    }
    /**
     * ## 渲染升级动画
     *
     * 调用专门渲染函数显示"LEVEL UP"文字和烟花效果
     */
    render() {
      const { level, fireworks, Game: Game2 } = this;
      this.emit(`ui:${Game2.id}:render:level:up`, { level, fireworks });
    }
  };
  var level_up_animation_default = LevelUpAnimation;

  // lib/game/constants/shapes.js
  var { PINK: PINK3, BLUE: BLUE4, TEAL: TEAL5, YELLOW: YELLOW5, VIOLET: VIOLET3, ORANGE: ORANGE5, GREEN: GREEN6, RED: RED5 } = colors_default;
  var SHAPES = [
    // I型方块（长条）：1行4列
    { shape: [[1, 1, 1, 1]], color: TEAL5 },
    // I型方块（长条）：1行5列
    { shape: [[1, 1, 1, 1, 1]], color: GREEN6 },
    // O型方块（正方形）：2x2
    {
      shape: [
        [1, 1],
        [1, 1]
      ],
      color: ORANGE5
    },
    // T型方块：2x3
    {
      shape: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      color: YELLOW5
    },
    // L型方块
    {
      shape: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      color: BLUE4
    },
    // J型方块
    {
      shape: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      color: PINK3
    },
    // S型方块（右斜）
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      color: RED5
    },
    // Z型方块（左斜）
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      color: VIOLET3
    }
  ];
  var shapes_default = SHAPES;

  // lib/game/utils/random-shape.js
  var randomShape = () => {
    const index = Math.floor(Math.random() * shapes_default.length);
    const piece = shapes_default[index];
    return {
      ...piece,
      shape: piece.shape.map((row) => [...row])
    };
  };
  var random_shape_default = randomShape;

  // lib/game/utils/get-next-piece.js
  var getNextPiece = (game) => {
    const { Replay, Store } = game;
    if (Replay.playing) {
      return Replay.getNextPiece();
    }
    const state = Store.getState();
    const { next } = state;
    const curr = next ? {
      ...next,
      shape: next.shape.map((row) => [...row])
    } : random_shape_default();
    return {
      curr,
      next: random_shape_default()
    };
  };
  var get_next_piece_default = getNextPiece;

  // lib/game/logic/collision.js
  var collision = (game, ox, oy) => {
    const { Elements, Store } = game;
    const { rows, cols } = Elements.Main;
    const state = Store.getState();
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
          const outOfBounds = nx < 0 || nx >= cols || ny >= rows;
          const hitBlock = ny >= 0 && ny < rows && board[ny][nx];
          if (outOfBounds || hitBlock) {
            return true;
          }
        }
      }
    }
    return false;
  };
  var collision_default = collision;

  // lib/game/core/over.js
  var over = (game) => {
    const { id, Store } = game;
    const mode = Store.getMode();
    if (mode === "game-over" || mode === "replay") {
      return;
    }
    game.emit(`replay:${id}:stop:record`);
    game.emit("audio:stop:bgm");
    game.emit("audio:resume:sound", { sound: "GAME_OVER" });
    game.emit(`replay:${id}:game:over`);
  };
  var over_default = over;

  // lib/game/logic/spawn.js
  var spawn = (game) => {
    const { id, Elements, Store } = game;
    const { cols } = Elements.Main;
    const { curr, next } = get_next_piece_default(game);
    if (!curr) {
      return;
    }
    Store.setState({
      // 当前方块 = 下一个方块，若不存在则随机生成
      curr,
      // 重新随机生成下一个预览方块
      next,
      // 水平居中：屏幕中间 - 方块宽度的一半
      cx: Math.floor(cols / 2) - Math.floor(curr.shape[0].length / 2),
      // 垂直位置从顶部开始
      cy: 0
    });
    const state = Store.getState();
    if (collision_default(game, 0, 0)) {
      over_default(game);
      return;
    }
    game.emit(`ui:${id}:render:next:piece`, { state });
    game.emit(`replay:${id}:add:piece`, state.curr);
  };
  var spawn_default = spawn;

  // lib/game/actions/set-beginning-state.js
  var setBeginningState = (game, mode, level = 1) => {
    const { Store } = game;
    game.emit("ui:update:mode", { mode });
    Store.setState({
      mode,
      score: 0,
      lines: 0,
      level,
      next: null
    });
    if (mode === "playing") {
      Store.setBeginningBoard(Store.generateBoard());
    }
  };
  var set_beginning_state_default = setBeginningState;

  // lib/game/core/begin.js
  var begin = (game) => {
    const { Store, id, Scheduler: Scheduler2 } = game;
    const $level = document.querySelector("#level");
    const level = Store.getLevel();
    if ($level) {
      $level.textContent = pad_start_default(Store.getLevel(), 2);
    }
    game.emit(`replay:${id}:start:record`);
    Store.resetBoard();
    set_beginning_state_default(game, "playing", level);
    spawn_default(game);
    game.emit("audio:resume:sound", { sound: "GAME_STARTED" });
    Scheduler2.delay(() => {
      game.emit("audio:resume:bgm", { level });
    }, 250);
  };
  var begin_default = begin;

  // lib/game/core/start.js
  var start = (game) => {
    const { id, Store } = game;
    const level = Store.getLevel();
    const lines = (level - 1) * 10;
    Store.setBaseLines(lines);
    game.emit(`game:${id}:start:countdown`, { game });
  };
  var start_default = start;

  // lib/game/core/resume.js
  var play = (game) => {
    const { id, Store } = game;
    const mode = Store.getMode();
    if (mode !== "paused") {
      return;
    }
    const level = Store.getLevel();
    game.emit(`ui:${id}:update:mode`, { mode: "playing" });
    Store.setMode("playing");
    game.emit(`game:${id}:stop:paused`);
    game.emit("audio:resume:sound", { sound: "RESUME" });
    game.emit("audio:resume:bgm", { level });
  };
  var play_default = play;

  // lib/game/core/pause.js
  var pause = (game) => {
    const { id, Store } = game;
    const mode = Store.getMode();
    if (mode !== "playing") {
      return;
    }
    game.emit(`ui:${id}:update:mode`, { mode: "paused" });
    Store.setMode("paused");
    game.emit("audio:stop:bgm");
    game.emit("audio:resume:sound", { sound: "PAUSED" });
    game.emit(`game:${id}:start:paused`);
  };
  var pause_default = pause;

  // lib/game/core/toggle-pause.js
  var togglePause = (game) => {
    const mode = game.Store.getMode();
    if (mode === "main-menu" || mode === "replay" || mode === "game-over") {
      return;
    }
    if (mode === "playing") {
      pause_default(game);
    } else {
      play_default(game);
    }
  };
  var toggle_pause_default = togglePause;

  // lib/game/core/reset.js
  var reset = (game, mode = "main-menu") => {
    const { id, Store } = game;
    let level = Store.getLevel();
    game.emit("audio:stop:bgm");
    game.emit(`animations:${id}:clear`);
    game.emit(`command:queue:${id}:clear`);
    Store.resetBoard();
    if (mode === "main-menu") {
      Store.setDifficulty("easy");
      level = 1;
      game.emit("audio:resume:sound", { sound: "SWITCH_SCENE" });
    }
    set_beginning_state_default(game, mode, level);
    game.emit(`ui:${id}:update:hud`, { state: Store.getState() });
    game.emit(`ui:${id}:update:mode`, { mode });
  };
  var reset_default = reset;

  // lib/game/core/restart.js
  var restart = (game) => {
    const { Store } = game;
    const mode = Store.getMode();
    if (mode !== "playing") {
      return;
    }
    const level = Store.getLevel();
    reset_default(game, "playing");
    spawn_default(game);
    game.emit("audio:resume:bgm", { level });
  };
  var restart_default = restart;

  // lib/game/logic/move.js
  var move = (game, ox, oy) => {
    const { Store } = game;
    const state = Store.getState();
    let { cx, cy } = state;
    if (!collision_default(game, ox, oy)) {
      cx += ox;
      cy += oy;
      Store.setState({
        cx,
        cy
      });
      game.emit("audio:resume:sound", { sound: "MOVE" });
      return true;
    }
    return false;
  };
  var move_default = move;

  // lib/game/logic/rotate.js
  var rotate = (game) => {
    const { Store } = game;
    const state = Store.getState();
    const { curr } = state;
    if (!curr) {
      return;
    }
    const currentShape = structuredClone(curr);
    const prev = curr.shape;
    currentShape.shape = prev[0].map(
      (_, i) => prev.map((r) => r[i]).toReversed()
    );
    Store.setState({
      curr: currentShape
    });
    if (collision_default(game, 0, 0)) {
      currentShape.shape = prev;
      Store.setState({
        curr: currentShape
      });
    } else {
      game.emit("audio:resume:sound", { sound: "ROTATE" });
    }
  };
  var rotate_default = rotate;

  // lib/game/logic/lock.js
  var lock = (game) => {
    const { Store } = game;
    const state = Store.getState();
    const { curr } = state;
    const s = curr.shape;
    const board = structuredClone(state.board);
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          board[state.cy + y][state.cx + x] = curr.color;
          Store.setState({
            board
          });
        }
      }
    }
  };
  var lock_default = lock;

  // lib/game/logic/find-full-lines.js
  var findFullLines = (game) => {
    const { Elements, Store } = game;
    const state = Store.getState();
    const { rows } = Elements.Main;
    const linesToClear = [];
    for (let y = rows - 1; y >= 0; y--) {
      const isLineFull = state.board[y].every((cell) => !!cell);
      if (isLineFull) {
        linesToClear.push(y);
      }
    }
    return linesToClear;
  };
  var find_full_lines_default = findFullLines;

  // lib/game/logic/clear-lines.js
  var clearLines = (game) => {
    const { id } = game;
    const linesToClear = find_full_lines_default(game);
    if (linesToClear.length === 0) {
      return;
    }
    game.Store.setClearLines(linesToClear);
    game.emit(`game:${id}:start:clear:lines`, { linesToClear });
  };
  var clear_lines_default = clearLines;

  // lib/game/logic/tick.js
  var tick = (game, isBlocked) => {
    const mode = game.Store.getMode();
    if (mode !== "playing" && mode !== "replay" || isBlocked) {
      return;
    }
    if (mode === "playing") {
      game.emit("dispatch:input", {
        device: "replay",
        action: "AUTO_TICK",
        payload: {
          Game: game
        }
      });
    }
    if (!move_default(game, 0, 1)) {
      lock_default(game);
      game.emit("audio:resume:sound", { sound: "FALL" });
      clear_lines_default(game);
      spawn_default(game);
    }
  };
  var tick_default = tick;

  // lib/game/logic/drop.js
  var drop = (game) => {
    while (true) {
      if (!move_default(game, 0, 1)) {
        break;
      }
    }
    lock_default(game);
    game.emit("audio:resume:sound", { sound: "FALL" });
    clear_lines_default(game);
    spawn_default(game);
    game.emit("audio:resume:sound", { sound: "DROP" });
  };
  var drop_default = drop;

  // lib/game/rules/get-speed.js
  var getSpeed = (game) => {
    const { Store, Level } = game;
    const level = Store.getLevel();
    const step = Math.ceil(1e3 / Math.floor(Level.max * 0.7));
    return Math.max(120, 1e3 - (level - 1) * step);
  };
  var get_speed_default = getSpeed;

  // lib/utils/get-storage.js
  var getStorage = (key) => localStorage.getItem(key);
  var get_storage_default = getStorage;

  // lib/utils/set-storage.js
  var setStorage = (key, value) => {
    localStorage.setItem(key, value);
  };
  var set_storage_default = setStorage;

  // lib/game/index.js
  var Game = class extends core_default {
    /**
     * ## 构造函数
     *
     * @class
     * @param {object} options - 配置（依赖的执行上下文）对象
     */
    constructor(options) {
      super(options);
      this.initialize();
    }
    initialize() {
      const { Elements, Scheduler: Scheduler2 } = this;
      const Store = new game_store_default({
        ...Elements.Main,
        GameState: game_state_default
      });
      this.id = crypto.randomUUID();
      this.effect = null;
      this.Store = Store;
      this.Animations = new animation_system_default({
        Game: this
      });
      this.CommandQueue = new command_queue_default({
        Game: this
      });
      this.UI = new ui_default({
        Game: this,
        Store,
        Elements
      });
      this.KeyboardController = new keyboard_default({
        Game: this,
        Store
      });
      this.Gamepad = new gamepad_controller_default({
        Game: this
      });
      this.Replay = new replay_controller_default({
        Game: this,
        Store,
        // 以后快进做准备
        Scheduler: Scheduler2
      });
    }
    selectLevel(level) {
      this.Store.setLevel(level);
      this.emit("audio:resume:sound", { sound: "LEVEL_CHANGED" });
    }
    switchToDifficulty() {
      this.Store.setMode("difficulty");
      this.emit("audio:resume:sound", { sound: "SWITCH_SCENE" });
    }
    selectDifficulty(difficulty) {
      this.Store.setDifficulty(difficulty);
      this.emit("audio:resume:sound", { sound: "DIFFICULTY_CHANGED" });
    }
    switchToMainMenu() {
      this.emit(`ui:${this.id}:update:mode`, { mode: "main-menu" });
      this.Store.setMode("main-menu");
      this.emit("audio:resume:sound", { sound: "SWITCH_SCENE" });
    }
    loadHighScore() {
      const highScore = Number.parseInt(get_storage_default("tetris-high-score"), 10) || 0;
      this.Store.setHighScore(highScore);
    }
    saveHighScore(score) {
      const { Store } = this;
      if (score > Store.getHighScore()) {
        Store.setHighScore(score);
        set_storage_default("tetris-high-score", score.toString());
      }
    }
    begin() {
      begin_default(this);
    }
    start() {
      start_default(this);
    }
    togglePause() {
      toggle_pause_default(this);
    }
    reset() {
      reset_default(this);
    }
    restart() {
      restart_default(this);
    }
    over() {
      over_default(this);
    }
    move(x, y) {
      move_default(this, x, y);
    }
    rotate() {
      rotate_default(this);
    }
    tick(isBlocked) {
      tick_default(this, isBlocked);
    }
    drop() {
      drop_default(this);
    }
    applyClearLines() {
      apply_clear_lines_default(this);
    }
    setBeginningState(mode, level = 1) {
      set_beginning_state_default(this, mode, level);
    }
    getSpeed() {
      return get_speed_default(this);
    }
    startCountdown() {
      this.Animations.register(
        new countdown_animation_default({
          Scheduler: this.Scheduler,
          Game: this
        })
      );
    }
    startPaused() {
      this.effect = new paused_animation_default({
        Scheduler: this.Scheduler
      });
      this.Animations.register(this.effect);
      this.effect.resume();
    }
    stopPaused() {
      if (!this.effect) {
        return;
      }
      this.effect.stop();
      this.effect = null;
    }
    startClearLines(linesToClear) {
      this.Animations.register(
        new clear_lines_animation_default({
          Game: this,
          lines: linesToClear
        })
      );
    }
    startLevelUp(level) {
      this.Animations.register(
        new level_up_animation_default({
          Scheduler: this.Scheduler,
          Game: this,
          UI: this.UI,
          level
        })
      );
    }
    subscribe() {
      const uuid = this.id;
      this.on(`game:${uuid}:update:state`, this._onUpdateState);
      this.on(`game:${uuid}:update:mode`, this._onUpdateMode);
      this.on(`game:${uuid}:update:level`, this._onUpdateLevel);
      this.on(
        `game:${uuid}:update:gamepad:connected`,
        this._onUpdateGamepadConnected
      );
      this.on(`game:${uuid}:update:hud`, this._onUpdateHud);
      this.on(`game:${uuid}:save:high:score`, this._onSaveHighScore);
      this.on(`game:${uuid}:select:level`, this._onSelectLevel);
      this.on(`game:${uuid}:switch:difficulty`, this._onSwitchToDifficulty);
      this.on(`game:${uuid}:select:difficulty`, this._onSelectDifficulty);
      this.on(`game:${uuid}:switch:to:main:menu`, this._onSwitchToMainMenu);
      this.on(`game:${uuid}:replay:prepare:board`, this._onReplayPrepareBoard);
      this.on(`game:${uuid}:begin`, this._onGameBegin);
      this.on(`game:${uuid}:start`, this._onGameStart);
      this.on(`game:${uuid}:toggle:paused`, this._onTogglePaused);
      this.on(`game:${uuid}:restart`, this._onGameRestart);
      this.on(`game:${uuid}:reset`, this._onGameReset);
      this.on(`game:${uuid}:over`, this._onGameOver);
      this.on(`game:${uuid}:block:move`, this._onBlockMove);
      this.on(`game:${uuid}:block:rotate`, this._onBlockRotate);
      this.on(`game:${uuid}:block:drop`, this._onBlockDrop);
      this.on(`game:${uuid}:block:tick`, this._onBlockTick);
      this.on(`game:${uuid}:toggle:bgm`, this._onToggleBGM);
      this.on(`game:${uuid}:start:countdown`, this._onStartCountdown);
      this.on(`game:${uuid}:start:paused`, this._onStartPaused);
      this.on(`game:${uuid}:stop:paused`, this._onStopPaused);
      this.on(`game:${uuid}:start:clear:lines`, this._onStartClearLines);
      this.on(`game:${uuid}:start:level:up`, this._onStartLevelUp);
      this.Keyboard.addEventListeners();
      this.Gamepad.addEventListeners();
      this.UI.subscribe();
      this.Replay.subscribe();
      this.Animations.subscribe();
      this.CommandQueue.subscribe();
    }
    unsubscribe() {
      const uuid = this.id;
      this.off(`game:${uuid}:update:state`, this._onUpdateState);
      this.off(`game:${uuid}:update:mode`, this._onUpdateMode);
      this.off(`game:${uuid}:update:level`, this._onUpdateLevel);
      this.off(
        `game:${uuid}:update:gamepad:connected`,
        this._onUpdateGamepadConnected
      );
      this.off(`game:${uuid}:update:hud`, this._onUpdateHud);
      this.off(`game:${uuid}:save:high:score`, this._onSaveHighScore);
      this.off(`game:${uuid}:select:level`, this._onSelectLevel);
      this.off(`game:${uuid}:switch:difficulty`, this._onSwitchToDifficulty);
      this.off(`game:${uuid}:select:difficulty`, this._onSelectDifficulty);
      this.off(`game:${uuid}:switch:to:main:menu`, this._onSwitchToMainMenu);
      this.off(`game:${uuid}:replay:prepare:board`, this._onReplayPrepareBoard);
      this.off(`game:${uuid}:begin`, this._onGameBegin);
      this.off(`game:${uuid}:start`, this._onGameStart);
      this.off(`game:${uuid}:toggle:paused`, this._onTogglePaused);
      this.off(`game:${uuid}:reset`, this._onGameReset);
      this.off(`game:${uuid}:restart`, this._onGameRestart);
      this.off(`game:${uuid}:over`, this._onGameOver);
      this.off(`game:${uuid}:block:move`, this._onBlockMove);
      this.off(`game:${uuid}:block:rotate`, this._onBlockRotate);
      this.off(`game:${uuid}:block:drop`, this._onBlockDrop);
      this.off(`game:${uuid}:block:tick`, this._onBlockTick);
      this.off(`game:${uuid}:toggle:bgm`, this._onToggleBGM);
      this.off(`game:${uuid}:start:countdown`, this._onStartCountdown);
      this.off(`game:${uuid}:start:paused`, this._onStartPaused);
      this.off(`game:${uuid}:stop:paused`, this._onStopPaused);
      this.off(`game:${uuid}:start:clear:lines`, this._onStartClearLines);
      this.off(`game:${uuid}:start:level:up`, this._onStartLevelUp);
      this.Keyboard.removeEventListeners();
      this.Gamepad.removeEventListeners();
      this.UI.unsubscribe();
      this.Replay.unsubscribe();
      this.Animations.unsubscribe();
      this.CommandQueue.unsubscribe();
    }
    _onUpdateState = ({ stateHandler }) => {
      this.Store.setState(stateHandler);
    };
    _onUpdateMode = ({ mode }) => {
      this.emit(`ui:${this.id}:update:mode`, { mode });
      this.Store.setMode(mode);
    };
    _onUpdateLevel = ({ level }) => {
      this.Store.setLevel(level);
    };
    _onUpdateHud = () => {
      const state = this.Store.getState();
      this.emit(`ui:${this.id}:update:hud`, { state });
    };
    _onSaveHighScore = () => {
      this.saveHighScore(this.Store.getScore());
    };
    _onSelectLevel = ({ level }) => {
      const state = this.Store.getState();
      this.selectLevel(level);
      this.emit(`ui:${this.id}:update:hud`, { state });
    };
    _onSwitchToDifficulty = () => {
      this.emit(`ui:${this.id}:update:mode`, { mode: "difficulty" });
      this.switchToDifficulty();
    };
    _onSelectDifficulty = ({ difficulty }) => {
      this.selectDifficulty(difficulty);
    };
    _onSwitchToMainMenu = () => {
      this.switchToMainMenu();
    };
    _onGameBegin = () => {
      this.begin();
    };
    _onGameStart = () => {
      this.start();
    };
    _onTogglePaused = () => {
      this.togglePause();
    };
    _onGameReset = () => {
      this.reset();
    };
    _onGameRestart = () => {
      this.restart();
    };
    _onGameOver = () => {
      this.over();
    };
    _onBlockMove = ({ ox, oy }) => {
      this.move(ox, oy);
    };
    _onBlockRotate = () => {
      this.rotate();
    };
    _onBlockDrop = () => {
      this.drop();
    };
    _onBlockTick = ({ isBlocked }) => {
      this.tick(isBlocked);
    };
    _onToggleBGM = () => {
      const { Store, Level } = this;
      const level = Store.getLevel();
      const maxLevel = Level.max;
      this.emit("audio:toggle:bgm", { level, maxLevel });
    };
    _onReplayPrepareBoard = () => {
      const { id, Store } = this;
      Store.resetBoard();
      Store.setState({
        // 绘制游戏开始难度设定产生的方块信息
        board: Store.getBeginningBoard(),
        score: 0,
        lines: 0,
        level: 1
      });
      this.emit(`ui:${id}:update:mode`, { mode: "replay" });
      Store.setMode("replay");
      this.emit(`ui:${id}:update:hud`, { state: Store.getState() });
      this.emit(`replay:${id}:start:play`);
      spawn_default(this);
    };
    _onUpdateGamepadConnected = ({ connected }) => {
      this.Store.setGamepadConnected(connected);
    };
    _onStartCountdown = () => {
      this.startCountdown();
    };
    _onStartPaused = () => {
      this.startPaused();
    };
    _onStopPaused = () => {
      this.stopPaused();
    };
    _onStartClearLines = ({ linesToClear }) => {
      this.startClearLines(linesToClear);
    };
    _onStartLevelUp = ({ level }) => {
      this.startLevelUp(level);
    };
  };
  var game_default2 = Game;

  // lib/engine/start-game-loop.js
  var startGameLoop = (timestamp) => {
    if (!engine_default.lastTickTime) {
      engine_default.lastTickTime = timestamp;
      engine_default.fixedAccumulator = timestamp;
    }
    const { Game: Game2, Scheduler: Scheduler2 } = engine_default;
    const { UI: UI2, Replay, Gamepad, Animations, CommandQueue: CommandQueue2 } = Game2;
    const isBlocked = Animations.hasBlocking();
    const stepDelta = timestamp - engine_default.fixedAccumulator;
    const prev = engine_default.lastTickTime ?? timestamp;
    let delta = (timestamp - prev) / 1e3;
    if (delta > 1e3) {
      delta = 1e3;
    }
    engine_default.lastTickTime = timestamp;
    Scheduler2.tick(timestamp);
    Replay.syncPlayElapsed({
      timestamp: engine_default.lastTickTime,
      isBlocked
    });
    Replay.update({
      speed: Game2.getSpeed(),
      timestamp: engine_default.lastTickTime
    });
    Gamepad.update(timestamp);
    CommandQueue2.flush();
    if ((!engine_default.fixedAccumulator || stepDelta > Game2.getSpeed()) && !Replay.playing) {
      Game2.tick(isBlocked);
      engine_default.fixedAccumulator = timestamp;
    }
    Animations.update(delta);
    UI2.tickHud(delta);
    UI2.render();
    Animations.render();
    engine_default.rafId = requestAnimationFrame(startGameLoop);
  };
  var start_game_loop_default = startGameLoop;

  // lib/engine/restart-game-loop.js
  var restartGameLoop = () => {
    engine_default.stop();
    engine_default.rafId = requestAnimationFrame(start_game_loop_default);
  };
  var restart_game_loop_default = restartGameLoop;

  // lib/engine/stop-game-loop.js
  var stopGameLoop = () => {
    if (!engine_default.rafId) {
      return;
    }
    cancelAnimationFrame(engine_default.rafId);
    engine_default.rafId = null;
    engine_default.lastTickTime = 0;
    engine_default.fixedAccumulator = 0;
  };
  var stop_game_loop_default = stopGameLoop;

  // lib/core/command/command.js
  var Command = class {
    /**
     * ## 创建一个命令实例
     *
     * @param {string} action - 命令类型（如 MOVE / ROTATE）
     * @param {object} [payload={}] - 命令参数（如方向、等级等）. Default is `{}`
     */
    constructor(action, payload = {}) {
      this.action = action;
      this.payload = payload;
    }
    #emit(event, payload) {
      event_bus_default.emit(event, payload);
    }
    /**
     * ## 执行命令
     *
     * 将命令交给统一的 dispatch 系统处理， 而不是在 Command 内部写逻辑。
     */
    execute() {
      const { action, payload } = this;
      this.#emit("dispatch:command", {
        action,
        payload
      });
    }
  };
  var command_default = Command;

  // lib/engine/dispatch-input.js
  var dispatchInput = (input, context) => {
    const { action, payload } = input;
    const { isBlocked, ms } = context;
    if (isBlocked || !action) {
      return;
    }
    const cmd = new command_default(action, payload);
    const { Game: Game2 } = payload;
    const { id } = Game2;
    event_bus_default.emit(`command:queue:${id}:enqueue`, { cmd });
    event_bus_default.emit(`replay:${id}:add:record`, {
      // 扣除暂停时间，得到纯净的“游玩时长”  - Replay.totalPausedDuration
      ms,
      cmd
    });
  };
  var dispatch_input_default = dispatchInput;

  // lib/game/actions/main-menu-actions.js
  var MAIN_MENU_ACTIONS = {
    /**
     * ## 选择难度 1
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_ONE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 1 });
    },
    /**
     * ## 选择难度 2
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_TWO: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 2 });
    },
    /**
     * ## 选择难度 3
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_THREE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 3 });
    },
    /**
     * ## 选择难度 4
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_FOUR: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 4 });
    },
    /**
     * ## 选择难度 5
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_FIVE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 5 });
    },
    /**
     * ## 选择难度 6
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_SIX: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 6 });
    },
    /**
     * ## 选择难度 7
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_SEVEN: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 7 });
    },
    /**
     * ## 选择难度 8
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_EIGHT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 8 });
    },
    /**
     * ## 选择难度 9
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_NINE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 9 });
    },
    /**
     * ## 选择难度 10
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    LEVEL_TEN: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:level`, { level: 10 });
    },
    /**
     * ## 进入难度选择界面
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    CONFIRM: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:switch:difficulty`);
    }
  };
  var main_menu_actions_default = MAIN_MENU_ACTIONS;

  // lib/game/actions/difficulty-actions.js
  var DIFFICULT_ACTIONS = {
    /**
     * ## 选择难度 easy
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    EASY: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:difficulty`, { difficulty: "easy" });
    },
    /**
     * ## 选择难度 normal
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    NORMAL: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:difficulty`, { difficulty: "normal" });
    },
    /**
     * ## 选择难度 hard
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    HARD: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:difficulty`, { difficulty: "hard" });
    },
    /**
     * ## 选择难度 expert
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    EXPERT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:select:difficulty`, { difficulty: "expert" });
    },
    /**
     * ## 返回游戏等级选择
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    BACK: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:switch:to:main:menu`);
    },
    /**
     * ## 确认开始游戏
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    CONFIRM: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:start`);
    }
  };
  var difficulty_actions_default = DIFFICULT_ACTIONS;

  // lib/game/actions/game-playing-actions.js
  var GAME_PLAYING_ACTIONS = {
    /**
     * ## 向左移动
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_LEFT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:move`, {
        ox: -1,
        oy: 0
      });
    },
    /**
     * ## 向右移动
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_RIGHT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:move`, {
        ox: 1,
        oy: 0
      });
    },
    /**
     * ## 向下移动（软降）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_DOWN: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:move`, {
        ox: 0,
        oy: 1
      });
    },
    /**
     * ## 旋转方块
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    ROTATE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:rotate`);
    },
    /**
     * ## 硬降（直接落地）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    DROP: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:drop`);
    },
    /**
     * ## 暂停 / 继续切换
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    TOGGLE_PAUSED: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:toggle:paused`);
    },
    /**
     * ## 重新开始游戏
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    RESTART: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:restart`);
    },
    /**
     * ## 强制结束游戏
     *
     * 注意：直接调用 over 属于“全局副作用”
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    QUIT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:over`);
    },
    /**
     * ## 背景音乐开关
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    TOGGLE_MUSIC: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:toggle:bgm`);
    }
  };
  var game_playing_actions_default = GAME_PLAYING_ACTIONS;

  // lib/game/actions/paused-actions.js
  var PAUSED_ACTIONS = {
    /**
     * ## 切换暂停状态
     *
     * 继续游戏 / 重新进入游戏循环）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    TOGGLE_PAUSED: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:toggle:paused`);
    }
  };
  var paused_actions_default = PAUSED_ACTIONS;

  // lib/game/actions/game-over-actions.js
  var GAME_OVER_ACTIONS = {
    /**
     * 确认操作（例如：Enter / Space / OK）
     *
     * 作用：
     *
     * - 重置游戏状态
     * - 返回主菜单
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    CONFIRM: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:reset`);
    }
  };
  var game_over_actions_default = GAME_OVER_ACTIONS;

  // lib/game/actions/replay-actions.js
  var REPLAY_ACTIONS = {
    /**
     * ## 向左移动
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_LEFT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:move`, {
        ox: -1,
        oy: 0
      });
    },
    /**
     * ## 向右移动
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_RIGHT: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:move`, {
        ox: 1,
        oy: 0
      });
    },
    /**
     * ## 向下移动（软降）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    MOVE_DOWN: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:move`, {
        ox: 0,
        oy: 1
      });
    },
    /**
     * ## 旋转方块
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    ROTATE: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:rotate`);
    },
    /**
     * ## 硬降（直接落地）
     *
     * @param {object} payload - 按键事件传递的参数对象
     */
    DROP: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:drop`);
    },
    /**
     * ## 自动下落
     *
     * @param {object} payload - 命令参数
     */
    AUTO_TICK: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:block:tick`, payload);
    },
    /**
     * 确认操作
     *
     * 作用：
     *
     * - 重置游戏状态
     * - 返回主菜单
     *
     * @param {object} payload - 命令参数
     */
    CONFIRM: (payload) => {
      const Game2 = payload?.Game;
      if (!Game2) {
        return;
      }
      Game2.emit(`game:${Game2.id}:reset`);
    }
  };
  var replay_actions_default = REPLAY_ACTIONS;

  // lib/engine/dispatch-command.js
  var ACTIONS_MAP = {
    "main-menu": main_menu_actions_default,
    difficulty: difficulty_actions_default,
    playing: game_playing_actions_default,
    paused: paused_actions_default,
    replay: replay_actions_default,
    "game-over": game_over_actions_default
  };
  var dispatchCommand = (cmd, { mode }) => {
    const { action, payload } = cmd;
    const actions = ACTIONS_MAP[mode];
    if (!actions) {
      return;
    }
    const handler = actions[action];
    handler?.(payload);
  };
  var dispatch_command_default = dispatchCommand;

  // lib/engine/index.js
  var Engine = {
    // Runtime 状态
    rafId: null,
    // 时间累积器（用于 fixed update / tick）
    fixedAccumulator: 0,
    // 上一帧时间戳
    lastTickTime: 0,
    Scheduler: null,
    Audio: null,
    Game: null,
    initialize: (options) => {
      Engine.Scheduler = new scheduler_default();
      const normalizedOptions = {
        ...options,
        Scheduler: Engine.Scheduler
      };
      Engine.Audio = new audio_default(normalizedOptions);
      Engine.Game = new game_default2(normalizedOptions);
    },
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
      Engine.initialize(configuration_default);
      const { Game: Game2 } = Engine;
      const { Store, UI: UI2 } = Game2;
      Store.resetBoard();
      Game2.loadHighScore();
      Game2.setBeginningState("main-menu");
      UI2.updateMode("main-menu");
      UI2.resize();
      UI2.updateHud();
      UI2.lazyRender();
      Engine.subscribe();
      Engine.start();
    },
    on: (event, payload) => {
      event_bus_default.on(event, payload);
    },
    subscribe: () => {
      const { Game: Game2, Audio: Audio2 } = Engine;
      Engine._subscribe();
      Audio2.subscribe();
      Game2.subscribe();
    },
    _subscribe() {
      const { Game: Game2 } = Engine;
      const { Animations, Replay } = Game2;
      Engine.on(`dispatch:command`, (cmd) => {
        const mode = Game2.Store.getMode();
        const isBlocked = Animations.hasBlocking([
          "clear-lines",
          "countdown",
          "level-up"
        ]);
        const { payload } = cmd;
        payload.isBlocked = isBlocked;
        dispatch_command_default(cmd, { mode });
      });
      Engine.on(`dispatch:input`, (input) => {
        const isBlocked = Animations.hasBlocking([
          "clear-lines",
          "countdown",
          "level-up"
        ]);
        const ms = Engine.lastTickTime - Replay.startTime;
        dispatch_input_default(input, { isBlocked, ms });
      });
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
