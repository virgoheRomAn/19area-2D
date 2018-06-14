import $ from "jquery";
import mousewheel from "./jquery.mousewheel";
import scrollbar from "./perfect-scrollbar";
require("./perfect-scrollbar.css");


export default {
    init: function (id, hasScrollBar) {
        $(id).perfectScrollbar({
            hasScrollBar: hasScrollBar
        });
    },
    update: function (id) {
        $(id).scrollTop(0);
        $(id).perfectScrollbar("update");
    },
    destroy: function (id) {
        $(id).perfectScrollbar("destroy");
    }
} 