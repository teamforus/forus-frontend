module.exports = [function() {
    return new(function() {
        this.storageKey = 'accounts';
        this.activeKey = 'active_account';

        this.getAccounts = function() {
            let accounts = localStorage.getItem(this.storageKey);

            if (accounts != null && accounts.length > 0) {
                accounts = JSON.parse(accounts);
            } else {
                accounts = [];
            }

            return accounts;
        };

        this.getAccount = function(access_token) {
            return this.getAccounts().filter(function(account) {
                return account.access_token == access_token;
            })[0]
        };

        this.add = function(access_token, name) {
            let accounts = this.getAccounts().filter(function(account) {
                return account.type != 'organisation'
            });

            accounts.push({
                access_token: access_token,
                name: name,
                type: 'personal',
            });

            localStorage.setItem(this.storageKey, JSON.stringify(accounts));
        };

        this.delete = function(access_token) {
            let accounts = this.getAccounts().filter(function(account) {
                return (
                    account.type != 'organisation' &&
                    account.access_token != access_token
                );
            });

            localStorage.setItem(this.storageKey, JSON.stringify(accounts));
        };

        this.set = function(access_token) {
            if (!access_token)
                localStorage.removeItem(this.activeKey);
            else
                localStorage.setItem(this.activeKey, access_token);
        };

        this.update = function(access_token, name) {
            this.delete(access_token);
            this.add(access_token, name);
        };

        this.get = function() {
            return localStorage.getItem(this.activeKey);
        };
    });
}];