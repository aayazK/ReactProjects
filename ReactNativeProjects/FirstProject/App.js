import React, { Component } from "react";
import {
  StyleSheet, Text, StatusBar, SafeAreaView, View, FlatList, AsyncStorage,
  Button, TextInput, Keyboard, Platform
} from "react-native";

const isAndroid = Platform.OS == "android";
const viewPadding = 10;

export default class App extends Component {
  state = {
    tasks: [],
    text: ""
  };

  changeTextHandler = text => {
    this.setState({ text: text });
  };

  addTask = () => {
    let notEmpty = this.state.text.trim().length > 0;
    if (notEmpty) {
      this.setState(
        prevState => {
          let { tasks, text } = prevState;
          return {
            tasks: tasks.concat({ key: tasks.length, text: text }),
            text: ""
          };
        },
        () => Tasks.save(this.state.tasks)
      );
    }
  };

  deleteTask = i => {
    this.setState(
      prevState => {
        let tasks = prevState.tasks.slice();

        tasks.splice(i, 1);

        return { tasks: tasks };
      },
      () => Tasks.save(this.state.tasks)
    );
  };

  componentDidMount() {
    Keyboard.addListener(
      isAndroid ? "keyboardDidShow" : "keyboardWillShow",
      e => this.setState({ viewPadding: e.endCoordinates.height + viewPadding })
    );

    Keyboard.addListener(
      isAndroid ? "keyboardDidHide" : "keyboardWillHide",
      () => this.setState({ viewPadding: viewPadding })
    );

    Tasks.all(tasks => this.setState({ tasks: tasks || [] }));
  }

  render() {
    return (
      <View style={[styles.container, { paddingBottom: this.state.viewPadding }]}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar backgroundColor="green" barStyle="light-content" />
          <FlatList
            style={styles.list}
            data={this.state.tasks}
            renderItem={({ item, index }) =>
              <View>
                <View style={styles.listItemCont}>
                  <Text style={styles.listItem}>
                    {item.text}
                  </Text>
                  <Button title="X" onPress={() => this.deleteTask(index)} />
                </View>
                <View style={styles.hr} />
              </View>
            }
          />
          <TextInput
            style={styles.textInput}
            onChangeText={this.changeTextHandler}
            onSubmitEditing={this.addTask}
            value={this.state.text}
            placeholder="Add Tasks"
            placeholderTextColor="red"
            returnKeyType="done"
            returnKeyLabel="done"
          />
        </SafeAreaView>
      </View>
    );
  }
}

let Tasks = {
  convertToArrayOfObject(tasks, callback) {
    return callback(
      tasks ? tasks.split("||").map((task, i) => ({ key: i, text: task })) : []
    );
  },
  convertToStringWithSeparators(tasks) {
    return tasks.map(task => task.text).join("||");
  },
  all(callback) {
    return AsyncStorage.getItem("TASKS", (err, tasks) =>
      this.convertToArrayOfObject(tasks, callback)
    );
  },
  save(tasks) {
    AsyncStorage.setItem("TASKS", this.convertToStringWithSeparators(tasks));
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    padding: viewPadding,
    paddingTop: 20
  },
  safeArea: {
    flex: 1,
    width: "100%",
  },
  list: {
    width: "100%"
  },
  listItem: {
    width: "90%",
    paddingTop: 20,
    paddingBottom: 20,
    paddingStart: 5,
    paddingEnd: 5,
    fontSize: 18
  },
  hr: {
    height: 1,
    backgroundColor: "gray"
  },
  listItemCont: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  textInput: {
    height: 50,
    paddingRight: 15,
    paddingLeft: 15,
    marginTop: 10,
    marginBottom: 10,
    borderColor: "gray",
    borderWidth: isAndroid ? 0 : 1,
    borderRadius: 25,
    fontSize: 18,
    width: "100%",
    color: "black"
  }
});
