window.onpopstate = function (event) {
    header();
}
document.addEventListener('DOMContentLoaded', function () {

    //Add Post
    var pf_1 = document.querySelector("#pf-1");
    var section_pf = document.body.contains(pf_1);

    if (section_pf == true) {
        document.querySelector('#pf-1').onsubmit = function (event) {

            body = document.querySelector('#pbody').value;

            fetch('/addpost', {
                    method: 'POST',
                    body: JSON.stringify({
                        body: body,
                    })
                })
                .then(response => response.json())
                .then(result => {
                    load_post_all(1)
                    return console.log(result.message)
                });
            document.querySelector('#pbody').value = '';
            event.preventDefault();
        };
        header();
    }

    var fllwp = document.querySelector("#fllwp");
    var fllwp1 = document.body.contains(fllwp);

    if (fllwp1 == true) {
        document.querySelector("#fllwp").onclick = function () {
            follow_posts(1)
        }
    }
    header();
});

function header() {
    var pf_1 = document.querySelector("#pf-1");
    var section_pf = document.body.contains(pf_1);
    if (section_pf == true) {
        document.querySelector('#pf-1').style.display = 'block';
    }
    document.querySelector('#pd').style.display = 'none';
    document.querySelector('#p-roll').innerHTML = '';
    load_post_all(1);
};

function load_post_all(page) {

    document.querySelector('#p-roll').innerHTML = '';

    //Load Post
    fetch(`loadposts/${page}`)

        .then(response => response.json())
        .then(response => {
            //Create Posts. console.log(response)
            for (post in response.posts) {
                div = document.createElement('div');
                if (response.user == response.posts[post].author_username) {

                    div.innerHTML = `<div class="card mt-2" "style="width: 100%;">
                <div class="card-body" id="${response.posts[post].id}">
                <span href="#" id="${response.posts[post].author_username}"class="card-title text-capitalize lup" style="color: black; font-size: 1.25rem;">${response.posts[post].author_username}</span>
                <h6 class="card-subtitle mb-2 text-muted">${response.posts[post].time_stamp}</h6>
                <p class="card-text text-edit" id="para${response.posts[post].id}">${response.posts[post].body}</p>
                <span class="card-link btn-like" id="like">&hearts; </span>
                <span class="number">${response.posts[post].likes}</span>
                <span class="btn btn-edit btn${response.posts[post].id}" id="${response.posts[post].id}">Edit Post</span>
                </div>
                </div>`

                } else {

                    div.innerHTML = `<div class="card mt-2" style="width: 100%;">
                <div class="card-body" id="${response.posts[post].id}">
                <span href="#" id="${response.posts[post].author_username}"class="card-title text-capitalize lup" style="color: black; font-size: 1.25rem;">${response.posts[post].author_username}</span>
                <h6 class="card-subtitle mb-2 text-muted">${response.posts[post].time_stamp}</h6>
                <p class="card-text">${response.posts[post].body}</p>
                <span class="card-link btn-like">&hearts;</span>
                <span class="number">${response.posts[post].likes}</span>
                </div>
                </div>`

                };

                document.querySelector('#p-roll').append(div)
                //Color for liked posts
                if (response.user != '') {
                    for (i in response.posts[post].liked_by) {
                        if (response.posts[post].liked_by[i].liked_by == response.userint) {
                            const postid = response.posts[post].id;
                            post = document.querySelector('#' + CSS.escape(postid));
                            post.querySelector('.btn-like').style.color = 'red';
                            break
                        };
                    };
                };
            };
            //Pagination

            if (response.current == 1) {
                document.querySelector('.page-item-previous').style.display = 'none';
                console.log(response.current)
            } else {
                document.querySelector('.page-item-previous').style.display = 'initial';
            }
            if (response.current == response.pages) {
                document.querySelector('.page-item-next').style.display = 'none';
            } else {
                document.querySelector('.page-item-next').style.display = 'initial';

            }

            //Load Posts per page
            document.querySelectorAll('.page-item-next').forEach(span => {
                span.onclick = () => {
                    const page = response.current + 1;
                    load_post_all(page)
                };
            });
            document.querySelectorAll('.page-item-previous').forEach(span => {
                span.onclick = () => {
                    const page = response.current - 1;
                    load_post_all(page)
                };
            });

            //Edit post 
            document.querySelectorAll('.btn-edit').forEach(span => {
                span.onclick = () => {

                    var post_id = event.currentTarget.id
                    const div = document.createElement('div');
                    div.innerHTML = `<form id="edit-post${post_id}">
                    <div class="form-group">
                    <textarea class="form-control textar" aria-label="With textarea" rows="4" id="pebody"></textarea>
                    </div>
                    <button class="btn btn-primary edit-btn" id=${post_id}>Save</button>
                    </form>`
                    const content = document.querySelector('#para' + CSS.escape(post_id)).innerText;
                    const para = document.querySelector('#para' + CSS.escape(post_id));
                    para.parentNode.replaceChild(div, para);

                    document.querySelector('.textar').innerText = content;
                    document.querySelector('.btn' + CSS.escape(post_id)).style.display = 'none';

                    document.querySelector('#edit-post' + CSS.escape(post_id)).onsubmit = function (event) {

                        let body = document.querySelector('#pebody').value;
                        let post_id = document.querySelector('.edit-btn').id;

                        fetch('/addpost', {
                                method: 'PUT',
                                body: JSON.stringify({
                                    body: body,
                                    post_id: post_id
                                })
                            })
                            .then(response => response.json())
                            .then(result => {
                                //return console.log(result.message)
                            });

                        const p = document.createElement('div');
                        p.innerHTML = `<p class="card-text text-edit" id="para${post_id}"></p>`;
                        const form = document.querySelector('#edit-post' + CSS.escape(post_id));
                        form.parentNode.replaceChild(p, form);
                        document.querySelector('#para' + CSS.escape(post_id)).innerHTML = body;
                        document.querySelector('.btn' + CSS.escape(post_id)).style.display = 'initial';
                        event.preventDefault();
                    };
                };
            });
            //Load-User-Profile
            document.querySelectorAll(".lup").forEach(span => {
                span.onclick = () => {
                    var page = 1;
                    const prfl_usrnm = `${event.currentTarget.id}`;
                    const prfl_usrnm_url = `${event.currentTarget.id}`;
                    //history.pushState('','prfl_usrnm',prfl_usrnm_url)
                    load_user_profile(prfl_usrnm_url, page)

                };
            });
            //Like-btn
            document.querySelectorAll(".btn-like").forEach(span => {
                span.onclick = () => {
                    if(response.user!=""){
                        let post_id = event.currentTarget.parentNode.id;
                        var post = document.querySelector('#' + CSS.escape(post_id));
                        var num1 = parseInt(post.querySelector('.number').innerHTML);
                        var elem = event.currentTarget;
                        if (elem.style.color == 'red') {
                            elem.style.color = 'black';
                            post.querySelector('.number').innerHTML = num1 - 1;
                        } else {
                            elem.style.color = 'red'
                            post.querySelector('.number').innerHTML = num1 + 1;
                        };
                        like_post(post_id);
                    } else{
                        alert("Please Login")
                    }
                        
                };
            });
        });
};

function load_user_profile(prfl_usrnm_url, page) {

    var pf_1 = document.querySelector("#pf-1");
    var section_pf = document.body.contains(pf_1);

    if (section_pf == true) {
        document.querySelector('#pf-1').style.display = 'none';
    }

    document.querySelector('#pd').style.display = 'block';
    document.querySelector('#p-roll').innerHTML = '';

    //User Profile
    fetch(prfl_usrnm_url)
        .then(response => response.json())
        .then(users => {
            console.log(users)
            document.querySelector('#profile').innerHTML = users.user[0].username;
            document.querySelector('#following').innerHTML = users.following;
            document.querySelector('#followers').innerHTML = users.followers;

            var utp1 = document.querySelector('#utp');
            var utp2 = document.body.contains(utp1);
            var following = users.user[0].username;

            if (utp2 == true) {
                var utp = document.querySelector('#utp').innerText;
                if (utp == following) {
                    document.querySelector('#flwbtn').style.display = 'none';
                } else {
                    document.querySelector('#flwbtn').style.display = 'block';
                };
                //Follow Button
                fetch(`f/${following}`)
                    .then(response => response.json())
                    .then(flusr => {
                        var flwbtn1 = document.querySelector('#flwbtn');
                        var flwbtn2 = document.body.contains(flwbtn1);
                        if (flwbtn2 == true) {
                            if (flusr.flusr == true) {
                                document.querySelector("#flwbtn").innerText = "Unfollow";
                            } else {
                                document.querySelector("#flwbtn").innerText = "Follow";
                            }
                            document.querySelector('#flwbtn').onclick = function () {
                                follow_unfollow(following);
                                elem = document.querySelector('#flwbtn');
                                if (elem.innerText == "Follow"){
                                    document.querySelector('#followers').innerHTML = users.followers + 1;
                                    elem.innerText = "Unfollow";
                                }else {
                                    num1 = document.querySelector('#followers').innerHTML;
                                    document.querySelector('#followers').innerHTML = num1 - 1;
                                    elem.innerText = "Follow";
                                };
                            };
                        };
                    });
            };
        });

    //diplay users-posts
    fetch(`${prfl_usrnm_url}/posts/${page}`)
        .then(response => response.json())
        .then(response => {
            for (post in response.posts) {
                div = document.createElement('div');
                if (response.user == response.posts[post].author_username) {

                    div.innerHTML = `<div class="card mt-2" "style="width: 100%;">
                <div class="card-body" id="${response.posts[post].id}">
                <span href="#" id="${response.posts[post].author_username}"class="card-title text-capitalize lup" style="color: black; font-size: 1.25rem;">${response.posts[post].author_username}</span>
                <h6 class="card-subtitle mb-2 text-muted">${response.posts[post].time_stamp}</h6>
                <p class="card-text text-edit" id="para${response.posts[post].id}">${response.posts[post].body}</p>
                <span class="card-link btn-like" id="like">&hearts; </span>
                <span class="number">${response.posts[post].likes}</span>
                <span class="btn btn-edit btn${response.posts[post].id}" id="${response.posts[post].id}">Edit Post</span>
                </div>
                </div>`

                } else {

                    div.innerHTML = `<div class="card mt-2" style="width: 100%;">
                <div class="card-body" id="${response.posts[post].id}">
                <span href="#" id="${response.posts[post].author_username}"class="card-title text-capitalize lup" style="color: black; font-size: 1.25rem;">${response.posts[post].author_username}</span>
                <h6 class="card-subtitle mb-2 text-muted">${response.posts[post].time_stamp}</h6>
                <p class="card-text">${response.posts[post].body}</p>
                <span class="card-link btn-like">&hearts;</span>
                <span class="number">${response.posts[post].likes}</span>
                </div>
                </div>`
                };

                document.querySelector('#p-roll').append(div)
                //Color for liked posts
                if (response.user != '') {
                    for (i in response.posts[post].liked_by) {
                        if (response.posts[post].liked_by[i].liked_by == response.userint) {
                            const postid = response.posts[post].id;
                            post = document.querySelector('#' + CSS.escape(postid));
                            post.querySelector('.btn-like').style.color = 'red';
                            break
                        }
                    }
                }

            };
            //Pagination
            if (response.current == 1) {
                document.querySelector('.page-item-previous').style.display = 'none';
                console.log(response.current)
                console.log(response.pages)
            } else {
                document.querySelector('.page-item-previous').style.display = 'initial';
            }
            if (response.current == response.pages) {
                document.querySelector('.page-item-next').style.display = 'none';
            } else {
                document.querySelector('.page-item-next').style.display = 'initial';

            }

            //Load Posts per page
            document.querySelectorAll('.page-item-next').forEach(span => {
                span.onclick = () => {
                    const page = response.current + 1;
                    load_user_profile(prfl_usrnm_url, page);
                };
            });
            document.querySelectorAll('.page-item-previous').forEach(span => {
                span.onclick = () => {
                    const page = response.current - 1;
                    load_user_profile(prfl_usrnm_url, page);
                };
            });

            //Edit-Post
            document.querySelectorAll('.btn-edit').forEach(span => {
                span.onclick = () => {

                    var post_id = event.currentTarget.id
                    const div = document.createElement('div');
                    div.innerHTML = `<form id="edit-post${post_id}">
                    <div class="form-group">
                    <textarea class="form-control textar" aria-label="With textarea" rows="4" id="pebody"></textarea>
                    </div>
                    <button class="btn btn-primary edit-btn" id=${post_id}>Save</button>
                    </form>`
                    const content = document.querySelector('#para' + CSS.escape(post_id)).innerText;
                    const para = document.querySelector('#para' + CSS.escape(post_id));
                    para.parentNode.replaceChild(div, para);

                    document.querySelector('.textar').innerText = content;
                    document.querySelector('.btn' + CSS.escape(post_id)).style.display = 'none';

                    document.querySelector('#edit-post' + CSS.escape(post_id)).onsubmit = function (event) {

                        let body = document.querySelector('#pebody').value;
                        let post_id = document.querySelector('.edit-btn').id;

                        fetch('/addpost', {
                                method: 'PUT',
                                body: JSON.stringify({
                                    body: body,
                                    post_id: post_id
                                })
                            })
                            .then(response => response.json())
                            .then(result => {
                                console.log(result.message)
                            });

                        const p = document.createElement('div');
                        p.innerHTML = `<p class="card-text text-edit" id="para${post_id}"></p>`;
                        const form = document.querySelector('#edit-post' + CSS.escape(post_id));
                        form.parentNode.replaceChild(p, form);
                        document.querySelector('#para' + CSS.escape(post_id)).innerHTML = body;
                        document.querySelector('.btn' + CSS.escape(post_id)).style.display = 'initial';
                        event.preventDefault();
                    };
                };
            });
            //Like-post
            document.querySelectorAll(".btn-like").forEach(span => {
                span.onclick = () => {
                    let post_id = event.currentTarget.parentNode.id;
                    var post = document.querySelector('#' + CSS.escape(post_id));
                    var num1 = parseInt(post.querySelector('.number').innerHTML);
                    var elem = event.currentTarget;
                    if (elem.style.color == 'red') {
                        elem.style.color = 'black';
                        post.querySelector('.number').innerHTML = num1 - 1;
                    } else {
                        elem.style.color = 'red'
                        post.querySelector('.number').innerHTML = num1 + 1;
                    };
                    like_post(post_id);
                };
            });
        });


};

function follow_unfollow(following) {

    fetch('follow_unfollow', {
            method: 'POST',
            body: JSON.stringify({
                follow: following,
            })
        })
        .then(response => response.json())
        .then(response => {
            //console.log(response)
        })
};

function follow_posts(page) {

    document.querySelector('#pf-1').style.display = 'none';
    document.querySelector('#pd').style.display = 'none';
    document.querySelector('#p-roll').innerHTML = '';

    fetch(`follow_posts/posts/${page}`)
        .then(response => response.json())
        .then(response => {
            console.log(response)
            for (post in response.posts) {
                div = document.createElement('div');
                if (response.user == response.posts[post].author_username) {

                    div.innerHTML = `<div class="card mt-2" "style="width: 100%;">
                <div class="card-body" id="${response.posts[post].id}">
                <span href="#" id="${response.posts[post].author_username}"class="card-title text-capitalize lup" style="color: black; font-size: 1.25rem;">${response.posts[post].author_username}</span>
                <h6 class="card-subtitle mb-2 text-muted">${response.posts[post].time_stamp}</h6>
                <p class="card-text text-edit" id="para${response.posts[post].id}">${response.posts[post].body}</p>
                <span class="card-link btn-like" id="like">&hearts; </span>
                <span class="number">${response.posts[post].likes}</span>
                <span class="btn btn-edit btn${response.posts[post].id}" id="${response.posts[post].id}">Edit Post</span>
                </div>
                </div>`

                } else {

                    div.innerHTML = `<div class="card mt-2" style="width: 100%;">
                <div class="card-body" id="${response.posts[post].id}">
                <span href="#" id="${response.posts[post].author_username}"class="card-title text-capitalize lup" style="color: black; font-size: 1.25rem;">${response.posts[post].author_username}</span>
                <h6 class="card-subtitle mb-2 text-muted">${response.posts[post].time_stamp}</h6>
                <p class="card-text">${response.posts[post].body}</p>
                <span class="card-link btn-like">&hearts;</span>
                <span class="number">${response.posts[post].likes}</span>
                </div>
                </div>`
                };

                document.querySelector('#p-roll').append(div)
                //Color for liked posts
                for (i in response.posts[post].liked_by) {
                    if (response.posts[post].liked_by[i].liked_by == response.userint) {
                        const postid = response.posts[post].id;
                        post = document.querySelector('#' + CSS.escape(postid));
                        post.querySelector('.btn-like').style.color = 'red';
                        break
                    }
                }
            };


            //Pagination
            if (response.current == 1) {
                document.querySelector('.page-item-previous').style.display = 'none';
            } else {
                document.querySelector('.page-item-previous').style.display = 'initial';
            }
            if (response.current == response.pages || response.pages == 0) {
                document.querySelector('.page-item-next').style.display = 'none';
            } else {
                document.querySelector('.page-item-next').style.display = 'initial';
                console.log(response.current)
            }

            //Load Posts per page
            document.querySelectorAll('.page-item-next').forEach(span => {
                span.onclick = () => {
                    const page = response.current + 1;
                    load_post_all(page)
                };
            });
            document.querySelectorAll('.page-item-previous').forEach(span => {
                span.onclick = () => {
                    const page = response.current - 1;
                    load_post_all(page)
                };
            });

            document.querySelectorAll(".lup").forEach(span => {
                span.onclick = () => {
                    var page = 1;
                    const prfl_usrnm = `${event.currentTarget.id}`
                    //history.pushState({prfl_usrnm:prfl_usrnm},'',prfl_usrnm)
                    load_user_profile(prfl_usrnm, page)

                };
            });
            document.querySelectorAll(".btn-like").forEach(span => {
                span.onclick = () => {
                    let post_id = event.currentTarget.parentNode.id;
                    var post = document.querySelector('#' + CSS.escape(post_id));
                    var num1 = parseInt(post.querySelector('.number').innerHTML);
                    var elem = event.currentTarget;
                    if (elem.style.color == 'red') {
                        elem.style.color = 'black';
                        post.querySelector('.number').innerHTML = num1 - 1;
                    } else {
                        elem.style.color = 'red'
                        post.querySelector('.number').innerHTML = num1 + 1;
                    };
                    like_post(post_id);
                };
            });
        });

};

function like_post(post_id) {

    fetch('/like', {
            method: 'PUT',
            body: JSON.stringify({
                body: "like",
                post_id: post_id
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result.message)
        });
}