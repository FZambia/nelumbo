package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
	"github.com/julienschmidt/httprouter"
	_ "github.com/mattn/go-sqlite3"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func init() {
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
}

func main() {

	var port string
	var address string
	var driver string
	var dsn string
	var webAppDir string
	var configFile string

	var rootCmd = &cobra.Command{
		Use:   "",
		Short: "Nelumbo",
		Long:  "Nelumbo server",
		Run: func(cmd *cobra.Command, args []string) {

			viper.SetDefault("port", "8000")
			viper.SetDefault("address", "127.0.0.1")
			viper.SetDefault("driver", "sqlite3")
			viper.SetDefault("dsn", ":memory:")
			viper.SetDefault("web", "")
			viper.SetConfigFile(configFile)
			viper.ReadInConfig()

			viper.SetEnvPrefix("nelumbo")
			viper.BindEnv("port", "address")

			viper.BindPFlag("port", cmd.Flags().Lookup("port"))
			viper.BindPFlag("address", cmd.Flags().Lookup("address"))
			viper.BindPFlag("driver", cmd.Flags().Lookup("driver"))
			viper.BindPFlag("dsn", cmd.Flags().Lookup("dsn"))
			viper.BindPFlag("web", cmd.Flags().Lookup("web"))

			fmt.Printf("%v\n", viper.AllSettings())

			db := sqlx.MustOpen(viper.GetString("driver"), viper.GetString("dsn"))

			schema := `CREATE TABLE IF NOT EXISTS message (
				uid varchar(36) PRIMARY KEY NOT NULL,
				sender varchar(64) NOT NULL,
				receiver varchar(64) NOT NULL,
				text text NOT NULL,
				video varchar(255) NOT NULL
			);`
			db.MustExec(schema)


			app := newApplication(db)

			router := httprouter.New()

			router.GET("/api/:uid/", app.retrieveHandler)
			router.POST("/api/", app.createHandler)

			appDir := viper.GetString("web")
			if appDir != "" {
				router.Handler("GET", "/", http.FileServer(http.Dir(appDir)))
				router.Handler("GET", "/public/*filepath", http.FileServer(http.Dir(appDir)))
			}

			addr := viper.GetString("address") + ":" + viper.GetString("port")
			log.Println("Starting HTTP server on", addr)
			if err := http.ListenAndServe(addr, router); err != nil {
				log.Fatal("ListenAndServe: ", err)
			}
		},
	}
	rootCmd.Flags().StringVarP(&port, "port", "p", "8000", "port")
	rootCmd.Flags().StringVarP(&address, "address", "a", "localhost", "address")
	rootCmd.Flags().StringVarP(&driver, "driver", "e", "sqlite3", "database driver")
	rootCmd.Flags().StringVarP(&dsn, "dsn", "d", ":memory:", "database DSN")
	rootCmd.Flags().StringVarP(&webAppDir, "web", "w", "", "Nelumbo web application directory")
	rootCmd.Flags().StringVarP(&configFile, "config", "c", "config.json", "path to config file")
	rootCmd.Execute()
}
