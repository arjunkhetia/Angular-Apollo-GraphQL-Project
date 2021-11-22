import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { split, InMemoryCache } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    // Uncomment this if want to use subscription in app.component.ts
    // {
    //   provide: APOLLO_OPTIONS,
    //   useFactory: (httpLink: HttpLink) => {
    //     return {
    //       cache: new InMemoryCache(),
    //       link: httpLink.create({
    //         uri: 'http://localhost:3000/graphql',
    //       }),
    //     };
    //   },
    //   deps: [HttpLink],
    // }
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink) {
        interface Definintion {
          kind: string;
          operation?: string;
        };
        const http = httpLink.create({
          uri: 'http://localhost:3000/graphql',
        });
        const ws = new WebSocketLink({
          uri: `ws://localhost:4000/graphql`,
          options: {
            reconnect: true,
          },
        });
        const link = split(
          ({ query }) => {
            const { kind, operation }: Definintion = getMainDefinition(query);
            return kind === 'OperationDefinition' && operation === 'subscription';
          },
          ws,
          http,
        );
        return {
          cache: new InMemoryCache(),
          link
        };
      },
      deps: [HttpLink],
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
