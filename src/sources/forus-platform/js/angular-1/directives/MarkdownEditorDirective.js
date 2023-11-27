const MarkdownEditorDirective = function ($scope, $element, $timeout, ModalService, MarkdownService) {
    const $dir = $scope.$dir;
    const $theEditor = $($element.find('[editor]')[0]);

    const find = (selector) => {
        return $element.find(selector);
    };

    const getEditingArea = () => {
        return $element.find('.note-editing-area');
    };

    const getCustomLink = (type, values) => {
        return new Promise((resolve) => $timeout(() => {
            ModalService.open('markdownCustomLink', {
                type: type,
                values: values,
                success: (data) => {
                    const { url, text, uid, alt } = data;

                    if (uid && $dir.mediaUploaded) {
                        $dir.mediaUploaded({
                            media_uid: uid,
                        });
                    }

                    resolve({ ...values, ...{ url, text, alt } });
                }
            });
        }, 0));
    }

    const AlignButton = (icon = "left") => {
        return function () {
            const ui = $.summernote.ui;
            const btnIcon = `mdi mdi-align-horizontal-${icon}`;

            const makeLabelItem = (text, action, icon = null) => {
                const inner = [
                    icon ? `<em class="mdi mdi-${icon}"></em>` : '',
                    `<span class="note-dropdown-label">${text}</span>`
                ].join('');

                return `<div data-action="${action}">${inner}</div>`
            };

            const event = ui.buttonGroup([
                ui.button({
                    contents: `<em class="${btnIcon}"/></em>`,
                    data: {
                        toggle: 'dropdown'
                    }
                }),
                ui.dropdown({
                    items: [
                        makeLabelItem('Tekst links uitlijnen', 'left', 'align-horizontal-left'),
                        makeLabelItem('Tekst in het midden uitlijnen', 'center', 'align-horizontal-center'),
                        makeLabelItem('Tekst rechts uitlijnen', 'right', 'align-horizontal-right'),
                    ],
                    callback: function (items) {
                        $(items).find('.note-dropdown-item [data-action]').on('click', function (e) {
                            const option = $(this);
                            const parent = $(items[0]).parent();
                            const dropdownBtn = parent.find('.note-btn');
                            const dropdownBtnIcon = dropdownBtn.find('.mdi');
                            const direction = option.data('action');

                            dropdownBtnIcon.attr('class', option.find('.mdi').attr('class'));

                            $timeout(() => $dir.blockAlignment = direction, 0);
                            e.preventDefault();
                        })
                    }
                })
            ]);

            // return button as jquery object
            return event.render();
        }
    }

    const CmsButton = (type = 'customLink', icon = "link") => {
        return function (context) {
            const ui = $.summernote.ui;
            const btnIcon = context.options.icons[icon];

            const showLinkDialog = function (linkInfo) {
                return new Promise((resolve) => {
                    const { text, url } = linkInfo;

                    getCustomLink(type, { text, url }).then((linkInfoResp) => {
                        resolve({ ...linkInfo, ...linkInfoResp });
                    });
                });
            };

            // create button
            const button = ui.button({
                contents: `<em class="${btnIcon}"/></em>`,
                // tooltip: 'hello',
                click: function () {
                    const buttons = $dir.buttons || [];

                    context.invoke('editor.saveRange');
                    buttons.forEach((button) => button.key == type ? button.handler($theEditor, button) : null);

                    if (type === 'customLink') {
                        const linkInfo = context.invoke('editor.getLinkInfo');
                        const { url, text } = linkInfo;

                        showLinkDialog({ url, text }).then((data) => {
                            context.invoke('editor.restoreRange');
                            context.invoke('editor.createLink', { ...linkInfo, ...data });
                        }, () => context.invoke('editor.restoreRange'));
                    }

                    if (type === 'imageLink' || type === 'youtubeLink') {
                        showLinkDialog({}).then((data) => {
                            const { alt, url } = data;

                            context.invoke('editor.restoreRange');

                            if (type === 'imageLink') {
                                context.invoke('editor.insertImage', url || '', (img) => img.attr('alt', alt || ''));
                            }

                            if (type === 'youtubeLink') {
                                const ytUrl = url
                                    .replace('https://youtu.be/', 'https://www.youtube.com/embed/')
                                    .replace('https://www.youtube.com/watch?v=', 'https://www.youtube.com/embed/')
                                    .split('&')[0];

                                const template =
                                    `<div class="youtube-root">` +
                                    `<iframe src="${ytUrl}" frameborder="0" allowfullscreen="1"></iframe>` +
                                    `</div>`;

                                context.invoke('editor.insertNode', $(template)[0]);
                            }
                        }, () => context.invoke('editor.restoreRange'));
                    }
                }
            });

            return button.render();   // return button as jquery object
        }
    }

    const CmsCodeMarkdown = () => {
        const timer = {
            timeout: null,
            interval: 500,
        }

        return function () {
            const ui = $.summernote.ui;
            const btnIcon = `mdi mdi-code-braces`;

            // create button
            const button = ui.button({
                contents: `<em class="${btnIcon}"/></em>`,
                // tooltip: 'hello',
                click: function () {
                    if (!$dir.codeArea) {
                        $dir.codeArea = document.createElement('textarea');
                        $dir.codeArea.classList.add('note-editing-code');
                        $dir.codeArea.value = $dir.ngModel ? $dir.ngModel : '';

                        getEditingArea().append($dir.codeArea);
                        find('.note-btn-group:not(.note-code) .note-btn').addClass('disabled');

                        $dir.codeArea.oninput = () => {
                            clearTimeout(timer.timeout);

                            timer.timeout = setTimeout(() => MarkdownService.toHtml($dir.codeArea.value).then((res) => {
                                replace(res.data.html);
                            }), timer.interval);
                        };
                    } else {
                        $theEditor.summernote('disable');
                        clearTimeout(timer.timeout);
                        
                        MarkdownService.toHtml($dir.codeArea.value).then((res) => {
                            replace(res.data.html);
                            $dir.codeArea.remove();
                            $dir.codeArea = null;
                            $theEditor.summernote('enable');
                        });
                    }
                }
            });

            return button.render();   // return button as jquery object
        }
    }

    const clear = () => {
        $theEditor.summernote('reset');
    }

    const insertText = (value) => {
        $theEditor.summernote('editor.insertText', value);
    };

    const insertHTML = (value) => {
        $theEditor.summernote('pasteHTML', value);
    };

    const replace = (value) => {
        return $theEditor.summernote("code", value);
    };

    const buildToolbarsList = (buttons) => {
        const allowLists = typeof $dir.allowLists == 'undefined' ? true : $dir.allowLists;
        const allowAlignment = typeof $dir.allowAlignment == 'undefined' ? false : $dir.allowAlignment;
        const extendedOptions = typeof $dir.extendedOptions == 'undefined' ? false : $dir.extendedOptions;
        const allowPreview = typeof $dir.allowPreview == 'undefined' ? false : $dir.allowPreview;
        const toolbars = [];

        toolbars.push(['style', ['style']]);
        toolbars.push(allowAlignment ? ['align', ['cmsBlockAlign']] : null);
        toolbars.push(['font', ['bold', 'italic', 'clear']]);
        toolbars.push(allowLists ? ['para', ['ol', 'ul']] : null);
        toolbars.push(extendedOptions ? ['table', ['table']] : null);
        toolbars.push(['cms', ['cmsLink', 'unlink', ...(extendedOptions ? ['cmsMedia', 'cmsLinkYoutube'] : [])]]);
        toolbars.push(['code', localStorage.markdownCode == 'true' ? ['cmsCodeMarkdown'] : '']);
        toolbars.push(['view', ['fullscreen', ...(allowPreview ? ['cmsMailView'] : [])]]);
        buttons.length && toolbars.push(['buttons', buttons.map((button) => button.key)]);

        return toolbars.filter((group) => group);
    };

    const initTheEditor = () => {
        const buttons = $dir.buttons || [];
        const icons = buttons.reduce((icons, btn) => ({ ...icons, [btn.iconKey || btn.key]: btn.icon }), {});

        $theEditor.summernote({
            placeholder: $dir.placeholder || '',
            tabsize: 4,
            height: 400,
            disableDragAndDrop: true,
            disableResizeImage: true,
            icons: {
                bold: 'mdi mdi-format-bold',
                italic: 'mdi mdi-format-italic',
                underline: 'mdi mdi-format-underline',
                eraser: 'mdi mdi-format-clear',

                caret: 'mdi mdi-menu-down',
                magic: 'mdi mdi-format-size',

                unorderedlist: 'mdi mdi-format-list-bulleted',
                orderedlist: 'mdi mdi-format-list-numbered',

                table: 'mdi mdi-table',
                close: 'mdi mdi-close',
                arrowsAlt: 'mdi mdi-fullscreen',

                link: 'mdi mdi-link',
                unlink: 'mdi mdi-link-off',
                picture: 'mdi mdi-image',
                video: 'mdi mdi-youtube',
                view: 'mdi mdi-eye-outline',

                rowBelow: 'mdi mdi-table-row-plus-after',
                rowAbove: 'mdi mdi-table-row-plus-before',

                colBefore: 'mdi mdi-table-column-plus-before',
                colAfter: 'mdi mdi-table-column-plus-after',

                rowRemove: 'mdi mdi-table-row-remove',
                colRemove: 'mdi mdi-table-column-remove',
                trash: 'mdi mdi-delete-outline',

                ...icons
            },

            styleTags: ['h1', 'h2', 'h3', 'h4', 'p'],
            toolbar: buildToolbarsList(buttons),
            buttons: {
                cmsLink: CmsButton('customLink', 'link'),
                cmsMedia: CmsButton('imageLink', 'picture'),
                cmsLinkYoutube: CmsButton('youtubeLink', 'video'),
                cmsMailView: CmsButton('mailPreview', 'view'),
                cmsBlockAlign: AlignButton(),
                cmsCodeMarkdown: CmsCodeMarkdown(),
            },
            callbacks: {
                onChange: function (content_html) {
                    const content = MarkdownService.toMarkdown(content_html);

                    $dir.ngModelCtrl.$setViewValue(content);
                    $dir.onUpdatedRaw && $dir.onUpdatedRaw({ data: { content, content_html } });
                },
                onPaste: function (e) {
                    var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                    e.preventDefault();
                    document.execCommand('insertText', false, bufferText);
                }
            },
        });

        $theEditor.summernote("removeModule", "linkPopover");
        $theEditor.summernote("removeModule", "imagePopover");
    }

    $dir.$onInit = () => {
        initTheEditor();

        if ($dir.disabled === 'true') {
            $theEditor.summernote('disable');
        }

        if (typeof $dir.bindEditor == 'function') {
            $dir.bindEditor({ editor: { editor: $theEditor, clear, replace, insertText, insertHTML } });
        }

        $dir.showCode = null;

        $scope.$watch('$dir.value', (value) => $theEditor.summernote("code", value), true);
    };
};


module.exports = () => {
    return {
        restrict: "EA",
        scope: {},
        bindToController: {
            bindEditor: '&',
            value: '=',
            ngModel: '<',
            modal: '=',
            buttons: '=',
            blockAlignment: '=',
            mediaUploaded: '&',
            onUpdatedRaw: '&',
            disabled: '@',
            placeholder: '@',
            extendedOptions: '=',
            allowLists: '=',
            allowAlignment: '=',
            allowPreview: '=',
        },
        require: {
            ngModelCtrl: 'ngModel',
        },
        popover: {
            link: [],
        },
        controllerAs: '$dir',
        replace: true,
        controller: [
            '$scope',
            '$element',
            '$timeout',
            'ModalService',
            'MarkdownService',
            MarkdownEditorDirective,
        ],
        templateUrl: 'assets/tpl/directives/markdown-editor.html'
    };
};
