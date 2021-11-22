import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo, QueryRef, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';
// Either use this here or use uncommented in app.module.ts
// import { WebSocketLink } from '@apollo/client/link/ws';

// const wsClient = new WebSocketLink({
//   uri: `ws://localhost:4000/graphql`,
//   options: {
//     reconnect: true,
//   },
// });

const QUERY = gql`
  query GetAllUsers {
    getAllUsers {
      id
      first_name
      last_name
      email
      gender
    }
  }
`;

const GET_USER = gql`
  query GetUser($id: Int) {
    getUser(id: $id) {
      id
      first_name
      last_name
      email
      gender
    }
  }
`;

const MUTATION = gql`
  mutation CreateUser($firstName: String, $lastName: String, $email: String, $gender: String) {
    createUser(first_name: $firstName, last_name: $lastName, email: $email, gender: $gender) {
      id
      first_name
      last_name
      email
      gender
    }
  }
`;

const SUBSCRIPTION = gql`
  subscription Subscription {
    newUser {
      id
      first_name
      last_name
      email
      gender
    }
  }
`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  public users: any[] = [];
  public loading: boolean = true;
  public id = '';
  public firstName = '';
  public lastName = '';
  public email = '';
  public gender = '';
  public querySubscription: Subscription = new Subscription;
  public mutationSubscription: Subscription = new Subscription;
  public getQuerySubscription: Subscription = new Subscription;
  public singleUser: any;
  public query!: QueryRef<any>;
  public subscribedUser: any;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.query = this.apollo.watchQuery<any>({
      query: QUERY,
      // pollInterval: 500  // query to execute periodically at a specified interval
    });
    this.querySubscription = this.query.valueChanges.subscribe((result: any) => {
      this.users = result?.data?.getAllUsers;
      this.loading = result.loading;
    });
    this.apollo.subscribe<any>({
      query: SUBSCRIPTION
    }).subscribe((result: any) => {
      console.log('got subscription data', result);
      this.subscribedUser = JSON.stringify(result?.data?.newUser);
    },(error: any) => {
      console.log('there was an error', error);
    });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
    this.getQuerySubscription.unsubscribe();
  }

  refresh() {
    this.query.refetch();
  }

  addUser() {
    this.apollo.mutate({
      mutation: MUTATION,
      variables: {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        gender: this.gender,
      }
    }).subscribe((result: any) => {
      console.log('got data', result);
      this.firstName = '';
      this.lastName = '';
      this.email = '';
      this.gender = '';
      this.refresh();
    },(error: any) => {
      console.log('there was an error sending the query', error);
    });
  }

  getUser() {
    this.getQuerySubscription = this.apollo.watchQuery<any>({
      query: GET_USER,
      variables: {
        id: parseInt(this.id)
      }
    }).valueChanges.subscribe((result: any) => {
      this.singleUser = JSON.stringify(result?.data?.getUser);
    });
  }

  subscribeToNewUser() {
    // this.mutationSubscription.
  }
  
}
