const turndownPluginGfm = require('../libs/turndown-plugin-gfm.cjs')

const MarkdownService = function () {
    return new (function () {
        this.getTurndownService = function() {
            const turndownService = (new TurndownService({ headingStyle: "atx" }));

            turndownService.addRule('strikethrough', {
                filter: (node) => {
                    return node.className === 'youtube-root' &&
                        node.children.length > 0 &&
                        node.children[0].tagName.toLowerCase() === 'iframe';
                },
                replacement: function () {
                    return `[](${arguments[1].children[0].src.replace(
                        'https://www.youtube.com/embed/',
                        'https://www.youtube.com/watch?v='
                    )})`;
                }
            });

            turndownService.use(turndownPluginGfm.gfm);

            return turndownService;
        };

        this.toMarkdown = function (content_html) {
            const turndownService = this.getTurndownService();
            const markdown = turndownService.turndown(content_html).split("\n");

            return markdown.map((line, index) => {
                return ((index != 0) && (markdown[index - 1] === '') && (line.trim() === '')) ? "&nbsp;  " : line;
            }).join("\n");
        };
    });
};

module.exports = [
    MarkdownService
];