/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import Dragula from "react-dragula";
import { WindowOpener } from "./components/windowOpener";
import ContentstackUIExtension from "@contentstack/ui-extensions-sdk";
import "./styles/style.css";


export class Home extends React.Component {
  constructor(props) {
    super(props);
    this.extension = {};
    this.state = {
      message: "",
      entryList: [],
      config: {},
      referenceTo: [],
      envList: [],
    };
    this.sonResponse = this.sonResponse.bind(this);
    this.isEmpty = this.isEmpty.bind(this);
  }

  componentDidMount() {
    ContentstackUIExtension.init().then((extension) => {
      let initialEntries = extension.field.getData();
      extension.window.enableAutoResizing();

      extension.stack.getEnvironments('get').then((result) => {
        this.setState({
          envList: result,
          apiKey: extension.stack.getData().api_key
        })
      });

      console.log('initialEntries', initialEntries, extension.field.schema.reference_to);

      if (initialEntries !== null && initialEntries !== undefined && !this.isEmpty(initialEntries)) {
        this.setState({
          config: extension.config,
          referenceTo: extension.field.schema.reference_to,
          entryList: initialEntries,
        }, () => {
          this.extension = extension;
          extension.window.enableAutoResizing();
          window.addEventListener("message", receiveMessage, false);
        });
      } else {
        this.setState({
          config: extension.config,
          referenceTo: extension.field.schema.reference_to
        }, () => {
          this.extension = extension;
          extension.window.enableAutoResizing();
          window.addEventListener("message", receiveMessage, false);
        });
      }
    });

    const receiveMessage = (event) => {
      const { data } = event;
      const { config, entryList, referenceTo, envList } = this.state;
      let query = config.query && JSON.parse((config.query).replace(/\'/g, '\"'))

      if (data.getConfig) {
        event.source.postMessage(
          {
            message: "Sending Config files",
            config,
            referenceTo: referenceTo,
            selectedRefEntries: entryList,
          },
          event.origin
        );
      } else if (data.selectedRefEntries) {
        this.saveExtensionData(data.selectedRefEntries);
      }
      else if (data.message === 'add') {
        this.getEntries(data.selectedRef, data.skip).then((result) => {
          event.source.postMessage({
            message: "Sending entries",
            entries: result
          }, event.origin);
        });
      } else if (data.message === 'loadmore') {
        this.getEntries(data.selectedRef, data.skip).then((result) => {
          event.source.postMessage({
            message: "loadmoreResult",
            loadmoreResult: result
          }, event.origin);
        });
      } else if (data.message === 'search') {
        if (config.query) {
          this.extension.stack.ContentType(data.selectedRef).Entry
            .Query()
            .query(query)
            .addParam('include_publish_details', 'true')
            .addParam('include_count', 'true')
            .limit(10)
            .regex('title', '^' + data.query, 'i')
            .find()
            .then(result => {
              result.entries.map((entry) => {
                let nameEnv = [];
                entry.publish_details.map((newEntry) => {
                  envList.environments.filter((env) => {
                    if (env.uid === newEntry.environment) nameEnv.push(env.name);
                  });
                  return nameEnv;
                });
                entry['publish_details'] = nameEnv;
                entry['content_type'] = data.selectedRef;
              });

              event.source.postMessage({
                message: "searchResult",
                searchResult: result
              }, event.origin)
            })
        } else {
          this.extension.stack.ContentType(data.selectedRef).Entry
            .Query()
            .addParam('include_publish_details', 'true')
            .addParam('include_count', 'true')
            .limit(10)
            .regex('title', '^' + data.query, 'i')
            .find()
            .then(result => {
              result.entries.map((entry) => {
                let nameEnv = [];
                entry.publish_details.map((newEntry) => {
                  envList.environments.filter((env) => {
                    if (env.uid === newEntry.environment) nameEnv.push(env.name);
                  });
                  return nameEnv;
                });
                entry['publish_details'] = nameEnv;
                entry['content_type'] = data.selectedRef;
              });

              event.source.postMessage({
                message: "searchResult",
                searchResult: result
              }, event.origin)
            })
        }
      }
    };
  }

  getEntries(contentTypeUid, skip) {
    let { config, envList } = this.state;
    let query = config.query && JSON.parse((config.query).replace(/\'/g, '\"'));

    if (config.query) {
      return new Promise(async (resolve, reject) => {
        this.extension.stack.ContentType(contentTypeUid).Entry
          .Query()
          .query(query)
          .addParam('include_publish_details', 'true')
          .addParam('include_count', 'true')
          .limit(10)
          .skip(skip[contentTypeUid])
          .find()
          .then(result => {
            result.entries.map((entry) => {
              let nameEnv = [];
              entry.publish_details.map((newEntry) => {
                envList.environments.filter((env) => {
                  if (env.uid === newEntry.environment) nameEnv.push(env.name);
                });
                return nameEnv;
              });
              entry['publish_details'] = nameEnv;
              entry['content_type'] = contentTypeUid;
            })
            resolve(result);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
    } else {
      return new Promise(async (resolve, reject) => {
        this.extension.stack.ContentType(contentTypeUid).Entry
          .Query()
          .addParam('include_publish_details', 'true')
          .addParam('include_count', 'true')
          .limit(10)
          .skip(skip[contentTypeUid])
          .find()
          .then(result => {
            result.entries.map((entry) => {
              let nameEnv = [];
              entry.publish_details.map((newEntry) => {
                envList.environments.filter((env) => {
                  if (env.uid === newEntry.environment) nameEnv.push(env.name);
                });
                return nameEnv;
              });
              entry['publish_details'] = nameEnv;
              entry['content_type'] = contentTypeUid;
            })
            resolve(result);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
    }
  }

  saveExtensionData(entries) {
    let extensionData = [];

    entries.forEach(selected => {
      extensionData.push(selected);
    });

    console.log('saveExtensionData', entries, extensionData);
    this.extension.field.setData(extensionData);
    this.setState({ entryList: entries });
  }

  removeEntry = (e) => {
    let id = e.currentTarget.dataset.id;
    let { entryList } = this.state;

    entryList.splice(
      entryList.findIndex((index) => index.uid === id),
      1
    );

    this.saveExtensionData(entryList);
  }

  sonResponse(err, res) {
    if (err) {
      this.setState({ message: res.message });
    }
  }

  dragulaDecorator = (componentBackingInstance) => {
    if (componentBackingInstance) {
      let options = {
        copySortSource: true,
      };
      Dragula([componentBackingInstance], options);
    }
  };

  isEmpty(obj) {
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    }
    return true;
  }

  render() {
    const { entryList, config, apiKey } = this.state;
    let host = (window.location != window.parent.location)
      ? document.referrer
      : document.location.href;

    return (
      <header className="App-header">
        <div className="wrapper">
          <div className="container">
            <div className="reference-loading" style={{ display: "none" }}>
              <div className="loading-flash">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
            <div className="main">
              <div className="selected-item">
                <div className="row selected-list">
                  <ul className="drag1" ref={this.dragulaDecorator}>
                    {entryList?.map((entry, index) => {
                      return (
                        <li id={entry.uid} key={index}>
                          <div className="file">
                            <div className="entry-ref">
                              <div>{entry.title}</div>
                              <div className="content-type">{entry.content_type}</div>
                            </div>
                            <div className="ref-action">
                              <span className="edit-entry">
                                <a href={`${host}#!/stack/${apiKey}/content-type/${entry.content_type}/en-us/entry/${entry.uid}/edit`} target="_blank">
                                  <img src="https://app.contentstack.com/static/images/edit-icon-ref1.svg" />
                                </a>
                              </span>
                              <span className="file-action trash" data-id={entry.uid} onClick={this.removeEntry.bind(this)}>
                                <img src="https://app.contentstack.com/static/images/remove-entry.svg" />
                              </span>
                            </div>

                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <WindowOpener
            url={config.redirectUrl}
            bridge={this.sonResponse}
            refEntries={entryList}
          >
            Choose Entry
          </WindowOpener>
        </div>
      </header>
    );
  }
}
